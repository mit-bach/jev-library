from __future__ import annotations

import json

import pytest
from conftest import endpoint_for

from jev_shadow.client import (
    ChoiceAnswer,
    NoulAnswer,
    ScoreAnswer,
    call_jev,
)
from jev_shadow.config import SecretKey
from jev_shadow.decision import build_questions

QUESTIONS = build_questions()
MODEL = "jev-1.13.0"


def _valid_envelope(*, score=0.0, confidence=1.0, noul=0.11, choice="cheap", model=MODEL):
    return {
        "model": model,
        "answers": {
            "difficulty": {
                "type": "score",
                "score": score,
                "confidence": confidence,
                "legend": {"0": "Low", "1": "Medium", "2": "High", "3": "Expert"},
                "probabilities": {"0": 1.0, "1": 0.0, "2": 0.0, "3": 0.0},
            },
            "needs_specialized_reasoning": {"type": "noul", "noul": noul},
            "suggested_tier": {
                "type": "choice",
                "choice": choice,
                "confidence": 0.87,
                "probabilities": {"cheap": 0.91, "standard": 0.09, "strong": 0.0},
            },
        },
        "usage": {"input_tokens": 120, "output_tokens": 40},
    }


def _json_response(payload: dict, status: int = 200):
    body = json.dumps(payload).encode("utf-8")
    return lambda: (status, body, {"Content-Type": "application/json"})


def _raw_response(body: bytes, status: int = 200):
    return lambda: (status, body, {"Content-Type": "application/json"})


def _call(server, *, timeout_seconds=2.0):
    return call_jev(
        endpoint=endpoint_for(server),
        api_key=SecretKey("test-key-not-real"),
        model=MODEL,
        state_text="redacted state text with enough alphanumerics",
        questions=QUESTIONS,
        timeout_seconds=timeout_seconds,
    )


def test_valid_envelope_parses_successfully(make_server):
    server = make_server(_json_response(_valid_envelope()))
    result = _call(server)
    assert result.ok is True
    assert result.reason is None
    assert isinstance(result.answers["difficulty"], ScoreAnswer)
    assert isinstance(result.answers["needs_specialized_reasoning"], NoulAnswer)
    assert isinstance(result.answers["suggested_tier"], ChoiceAnswer)
    assert result.answers["difficulty"].score == 0.0
    assert result.answers["needs_specialized_reasoning"].noul == 0.11
    assert result.answers["suggested_tier"].choice == "cheap"
    assert result.input_tokens == 120
    assert result.cost_usd == pytest.approx(120 * 0.042 / 1e6)
    assert result.latency_ms >= 0
    assert result.http_status == 200


def test_noul_answer_without_confidence_key_parses(make_server):
    payload = _valid_envelope()
    assert "confidence" not in payload["answers"]["needs_specialized_reasoning"]
    server = make_server(_json_response(payload))
    result = _call(server)
    assert result.ok is True
    assert result.answers["needs_specialized_reasoning"].confidence is None


def test_missing_answer_id_is_invalid(make_server):
    payload = _valid_envelope()
    del payload["answers"]["suggested_tier"]
    server = make_server(_json_response(payload))
    result = _call(server)
    assert result.ok is False
    assert result.reason == "invalid_response"


def test_out_of_range_score_is_invalid(make_server):
    payload = _valid_envelope(score=99.0)
    server = make_server(_json_response(payload))
    result = _call(server)
    assert result.ok is False
    assert result.reason == "invalid_response"


def test_non_finite_score_is_invalid(make_server):
    raw = json.dumps(_valid_envelope()).replace('"score": 0.0', '"score": NaN')
    server = make_server(_raw_response(raw.encode("utf-8")))
    result = _call(server)
    assert result.ok is False
    assert result.reason == "invalid_response"


def test_non_numeric_score_is_invalid(make_server):
    payload = _valid_envelope()
    payload["answers"]["difficulty"]["score"] = "high"
    server = make_server(_json_response(payload))
    result = _call(server)
    assert result.ok is False
    assert result.reason == "invalid_response"


def test_wrong_answer_type_is_invalid(make_server):
    payload = _valid_envelope()
    payload["answers"]["difficulty"]["type"] = "noul"
    server = make_server(_json_response(payload))
    result = _call(server)
    assert result.ok is False
    assert result.reason == "invalid_response"


def test_wrong_pinned_model_is_invalid(make_server):
    payload = _valid_envelope(model="some-other-model-9.9.9")
    server = make_server(_json_response(payload))
    result = _call(server)
    assert result.ok is False
    assert result.reason == "invalid_response"


def test_pinned_model_prefix_match_is_accepted(make_server):
    payload = _valid_envelope(model="jev-1.13.0-beta")
    server = make_server(_json_response(payload))
    result = _call(server)
    assert result.ok is True


def test_duplicate_json_keys_are_invalid(make_server):
    raw = (
        b'{"model": "jev-1.13.0", "model": "jev-1.13.0", '
        b'"answers": {}, "usage": {"input_tokens": 1}}'
    )
    server = make_server(_raw_response(raw))
    result = _call(server)
    assert result.ok is False
    assert result.reason == "invalid_response"


def test_oversize_response_body_is_rejected(make_server):
    from jev_shadow.client import MAX_RESPONSE_BYTES

    padding = "x" * (MAX_RESPONSE_BYTES + 10)
    server = make_server(_raw_response(padding.encode("utf-8")))
    result = _call(server)
    assert result.ok is False
    assert result.reason == "response_too_large"


def test_non_json_body_is_invalid(make_server):
    server = make_server(_raw_response(b"not json at all"))
    result = _call(server)
    assert result.ok is False
    assert result.reason == "invalid_response"


@pytest.mark.parametrize(
    "status,expected_reason",
    [
        (401, "authentication"),
        (403, "authentication"),
        (402, "payment_required"),
        (429, "rate_limited"),
        (500, "http_error"),
        (503, "http_error"),
    ],
)
def test_http_status_maps_to_bounded_reason(make_server, status, expected_reason):
    server = make_server(_raw_response(b"{}", status=status))
    result = _call(server)
    assert result.ok is False
    assert result.http_status == status
    assert result.reason == expected_reason


def test_redirect_is_not_followed(make_server):
    server = make_server(
        lambda: (302, b"", {"Location": "http://127.0.0.1:1/elsewhere"})
    )
    result = _call(server)
    assert result.ok is False
    assert result.reason == "http_error"
    assert server.request_count == 1


def test_timeout_is_reported(make_server):
    server = make_server(_json_response(_valid_envelope()), delay_seconds=1.0)
    result = _call(server, timeout_seconds=0.05)
    assert result.ok is False
    assert result.reason == "timeout"


def test_authorization_header_uses_bearer_scheme(make_server):
    server = make_server(_json_response(_valid_envelope()))
    _call(server)
    assert server.received_headers[0]["Authorization"] == "Bearer test-key-not-real"


def test_never_raises_on_malformed_response(make_server):
    server = make_server(_raw_response(b"\xff\xfe garbage"))
    try:
        result = _call(server)
    except Exception as exc:  # pragma: no cover - failure path
        pytest.fail(f"call_jev raised: {exc!r}")
    assert result.ok is False
