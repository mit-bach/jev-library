"""The Jev HTTP call: request construction, strict response validation.

Never raises out of :func:`call_jev`. Every failure path -- transport,
timeout, HTTP status, malformed body -- becomes a bounded reason code on the
returned :class:`JevResult`; nothing here ever includes the API key, the
request body, the response body, or an exception's own text in that reason.
"""

from __future__ import annotations

import contextlib
import json
import math
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any

from .config import SecretKey

#: Bound the response body before parsing, regardless of any Content-Length
#: header (which may be absent or wrong).
MAX_RESPONSE_BYTES = 256 * 1024

#: USD per million input tokens. Output tokens are free.
COST_PER_MILLION_INPUT_TOKENS_USD = 0.042


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args: Any, **kwargs: Any) -> None:
        return None


@dataclass(frozen=True)
class ScoreAnswer:
    score: float
    confidence: float | None


@dataclass(frozen=True)
class NoulAnswer:
    noul: float
    confidence: float | None = None


@dataclass(frozen=True)
class ChoiceAnswer:
    choice: str
    confidence: float | None


Answer = ScoreAnswer | NoulAnswer | ChoiceAnswer


@dataclass(frozen=True)
class JevResult:
    """Outcome of one Jev call. ``ok`` is False for every failure path."""

    ok: bool
    answers: dict[str, Answer] | None
    input_tokens: int | None
    cost_usd: float | None
    latency_ms: float
    http_status: int | None
    reason: str | None


def _is_finite_number(value: Any) -> bool:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return False
    return math.isfinite(value)


def _confidence_from(raw: dict, *, key: str = "confidence") -> tuple[float | None, bool]:
    """Extract an optional confidence field. Returns (value, is_valid)."""
    if key not in raw:
        return None, True
    value = raw[key]
    if not _is_finite_number(value) or not (0.0 <= float(value) <= 1.0):
        return None, False
    return float(value), True


def _no_duplicate_keys(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    seen: set[str] = set()
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in seen:
            raise ValueError(f"duplicate key: {key}")
        seen.add(key)
        result[key] = value
    return result


def _validate_answer(question_id: str, spec: dict, raw: Any) -> Answer | None:
    """Validate one answer against its question spec. None => invalid."""
    if not isinstance(raw, dict):
        return None
    expected_type = spec.get("type")
    if raw.get("type") != expected_type:
        return None

    if expected_type == "score":
        criteria = spec.get("criteria")
        if not isinstance(criteria, list) or not criteria:
            return None
        score = raw.get("score")
        if not _is_finite_number(score):
            return None
        upper = len(criteria) - 1 + 0.001
        if not (-0.001 <= float(score) <= upper):
            return None
        confidence, valid = _confidence_from(raw)
        if not valid:
            return None
        return ScoreAnswer(score=float(score), confidence=confidence)

    if expected_type == "noul":
        noul = raw.get("noul")
        if not _is_finite_number(noul) or not (0.0 <= float(noul) <= 1.0):
            return None
        confidence, valid = _confidence_from(raw)
        if not valid:
            return None
        return NoulAnswer(noul=float(noul), confidence=confidence)

    if expected_type == "choice":
        criteria = spec.get("criteria")
        if not isinstance(criteria, dict) or not criteria:
            return None
        choice = raw.get("choice")
        if not isinstance(choice, str) or choice not in criteria:
            return None
        confidence, valid = _confidence_from(raw)
        if not valid:
            return None
        return ChoiceAnswer(choice=choice, confidence=confidence)

    return None


def _parse_and_validate(
    body_text: str,
    *,
    model: str,
    questions: dict[str, dict],
) -> tuple[dict[str, Answer], int | None] | None:
    """Returns (answers, input_tokens) or None if the body is invalid."""
    try:
        envelope = json.loads(body_text, object_pairs_hook=_no_duplicate_keys)
    except (ValueError, TypeError):
        return None

    if not isinstance(envelope, dict):
        return None

    envelope_model = envelope.get("model")
    if not isinstance(envelope_model, str) or not envelope_model.startswith(model):
        return None

    answers_raw = envelope.get("answers")
    if not isinstance(answers_raw, dict):
        return None
    if set(answers_raw.keys()) != set(questions.keys()):
        return None

    answers: dict[str, Answer] = {}
    for question_id, spec in questions.items():
        validated = _validate_answer(question_id, spec, answers_raw[question_id])
        if validated is None:
            return None
        answers[question_id] = validated

    input_tokens: int | None = None
    usage = envelope.get("usage")
    if usage is not None:
        if not isinstance(usage, dict):
            return None
        if "input_tokens" in usage:
            raw_tokens = usage["input_tokens"]
            if isinstance(raw_tokens, bool) or not isinstance(raw_tokens, int) or raw_tokens < 0:
                return None
            input_tokens = raw_tokens

    return answers, input_tokens


def _status_reason(status: int) -> str:
    if status in (401, 403):
        return "authentication"
    if status == 402:
        return "payment_required"
    if status == 429:
        return "rate_limited"
    return "http_error"


def call_jev(
    *,
    endpoint: str,
    api_key: SecretKey,
    model: str,
    state_text: str,
    questions: dict[str, dict],
    timeout_seconds: float,
) -> JevResult:
    """POST one Jev request and strictly validate the response.

    ``state_text`` must already be the fully redacted, serialized state --
    this function does no redaction of its own. Never raises.
    """
    payload = json.dumps({"model": model, "state": state_text, "questions": questions}).encode(
        "utf-8"
    )
    request = urllib.request.Request(
        endpoint,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key.reveal()}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    opener = urllib.request.build_opener(_NoRedirect)

    start = time.monotonic()
    try:
        with opener.open(request, timeout=timeout_seconds) as response:
            body = response.read(MAX_RESPONSE_BYTES + 1)
            status = response.getcode()
    except urllib.error.HTTPError as exc:
        latency_ms = (time.monotonic() - start) * 1000.0
        with contextlib.suppress(Exception):
            exc.read(MAX_RESPONSE_BYTES + 1)
        exc.close()
        return JevResult(
            ok=False,
            answers=None,
            input_tokens=None,
            cost_usd=None,
            latency_ms=latency_ms,
            http_status=exc.code,
            reason=_status_reason(exc.code),
        )
    except TimeoutError:
        latency_ms = (time.monotonic() - start) * 1000.0
        return JevResult(
            ok=False,
            answers=None,
            input_tokens=None,
            cost_usd=None,
            latency_ms=latency_ms,
            http_status=None,
            reason="timeout",
        )
    except urllib.error.URLError as exc:
        latency_ms = (time.monotonic() - start) * 1000.0
        reason = "timeout" if isinstance(exc.reason, TimeoutError) else "transport_error"
        return JevResult(
            ok=False,
            answers=None,
            input_tokens=None,
            cost_usd=None,
            latency_ms=latency_ms,
            http_status=None,
            reason=reason,
        )
    except OSError:
        latency_ms = (time.monotonic() - start) * 1000.0
        return JevResult(
            ok=False,
            answers=None,
            input_tokens=None,
            cost_usd=None,
            latency_ms=latency_ms,
            http_status=None,
            reason="transport_error",
        )

    latency_ms = (time.monotonic() - start) * 1000.0

    if status != 200:
        return JevResult(
            ok=False,
            answers=None,
            input_tokens=None,
            cost_usd=None,
            latency_ms=latency_ms,
            http_status=status,
            reason=_status_reason(status),
        )

    if len(body) > MAX_RESPONSE_BYTES:
        return JevResult(
            ok=False,
            answers=None,
            input_tokens=None,
            cost_usd=None,
            latency_ms=latency_ms,
            http_status=status,
            reason="response_too_large",
        )

    try:
        body_text = body.decode("utf-8")
    except UnicodeDecodeError:
        return JevResult(
            ok=False,
            answers=None,
            input_tokens=None,
            cost_usd=None,
            latency_ms=latency_ms,
            http_status=status,
            reason="invalid_response",
        )

    parsed = _parse_and_validate(body_text, model=model, questions=questions)
    if parsed is None:
        return JevResult(
            ok=False,
            answers=None,
            input_tokens=None,
            cost_usd=None,
            latency_ms=latency_ms,
            http_status=status,
            reason="invalid_response",
        )

    answers, input_tokens = parsed
    cost_usd = (
        input_tokens * COST_PER_MILLION_INPUT_TOKENS_USD / 1e6 if input_tokens is not None else None
    )

    return JevResult(
        ok=True,
        answers=answers,
        input_tokens=input_tokens,
        cost_usd=cost_usd,
        latency_ms=latency_ms,
        http_status=status,
        reason=None,
    )
