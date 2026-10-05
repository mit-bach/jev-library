from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest
from conftest import endpoint_for, good_redactor, leaky_redactor

from jev_shadow.client import ChoiceAnswer, JevResult, NoulAnswer, ScoreAnswer
from jev_shadow.config import SecretKey, Settings
from jev_shadow.decision import QUESTION_DIFFICULTY, QUESTION_NOUL, QUESTION_TIER_CHOICE, Turn
from jev_shadow.events import ShadowEventSink
from jev_shadow.harness import JevShadowHarness


def _turn(**overrides) -> Turn:
    defaults = dict(
        user_message="hello there",
        current_model="hermes-4",
        available_models=("hermes-4-mini", "hermes-4", "hermes-4-pro"),
    )
    defaults.update(overrides)
    return Turn(**defaults)


def _settings(**overrides) -> Settings:
    defaults = dict(api_key=SecretKey("test-key-not-real"))
    defaults.update(overrides)
    return Settings(**defaults)


class _CountingCallJev:
    def __init__(self, result: JevResult | None = None, *, raises: bool = False):
        self.calls = 0
        self._result = result
        self._raises = raises

    def __call__(self, **kwargs):
        self.calls += 1
        if self._raises:
            raise RuntimeError("should never see this")
        return self._result


def _success_result(*, score=0.0, noul=0.1, choice="cheap") -> JevResult:
    return JevResult(
        ok=True,
        answers={
            QUESTION_DIFFICULTY: ScoreAnswer(score=score, confidence=1.0),
            QUESTION_NOUL: NoulAnswer(noul=noul, confidence=None),
            QUESTION_TIER_CHOICE: ChoiceAnswer(choice=choice, confidence=0.8),
        },
        input_tokens=100,
        cost_usd=100 * 0.042 / 1e6,
        latency_ms=12.5,
        http_status=200,
        reason=None,
    )


def test_disabled_skips_without_network_call():
    call_jev = _CountingCallJev(raises=True)
    harness = JevShadowHarness(
        settings=_settings(enabled=False), call_jev=call_jev, redactor=good_redactor
    )
    event = harness.decide(_turn(), session_id="s1", turn_id="t1")
    assert event.outcome == "skipped"
    assert event.reason == "disabled"
    assert call_jev.calls == 0
    assert event.current_heuristic_tier == "standard"


def test_kill_file_skips_without_network_call(tmp_path: Path):
    kill_file = tmp_path / "kill"
    kill_file.write_text("stop")
    call_jev = _CountingCallJev(raises=True)
    harness = JevShadowHarness(
        settings=_settings(kill_file=kill_file), call_jev=call_jev, redactor=good_redactor
    )
    event = harness.decide(_turn(), session_id="s1", turn_id="t1")
    assert event.outcome == "skipped"
    assert event.reason == "kill_switch"
    assert call_jev.calls == 0


def test_missing_credential_skips_without_network_call():
    call_jev = _CountingCallJev(raises=True)
    harness = JevShadowHarness(
        settings=_settings(api_key=None), call_jev=call_jev, redactor=good_redactor
    )
    event = harness.decide(_turn(), session_id="s1", turn_id="t1")
    assert event.outcome == "skipped"
    assert event.reason == "missing_credential"
    assert call_jev.calls == 0


def test_no_redactor_skips_without_network_call():
    call_jev = _CountingCallJev(raises=True)
    # allow_ambient=False so this is deterministic regardless of what a host
    # environment happens to have importable as `agent.redact` -- it forces
    # unavailability rather than depending on what is installed.
    harness = JevShadowHarness(
        settings=_settings(allow_ambient=False), call_jev=call_jev, redactor=None
    )
    event = harness.decide(_turn(), session_id="s1", turn_id="t1")
    assert event.outcome == "skipped"
    assert event.reason == "redaction_unavailable"
    assert call_jev.calls == 0


def test_insufficient_redaction_skips_without_network_call():
    call_jev = _CountingCallJev(raises=True)
    harness = JevShadowHarness(settings=_settings(), call_jev=call_jev, redactor=leaky_redactor)
    turn = _turn(user_message="my key is sk-abcdefghijklmnopqrstuvwxyz1234")
    event = harness.decide(turn, session_id="s1", turn_id="t1")
    assert event.outcome == "skipped"
    assert event.reason == "redaction_insufficient"
    assert call_jev.calls == 0


def test_default_settings_resolve_ambient_redactor_when_available(tmp_path: Path, monkeypatch):
    """Settings.allow_ambient defaults to True, so the intended in-process-Hermes
    case (agent.redact already importable, no explicit redactor or root given)
    actually resolves it -- a default of False here would make the integration
    dead code (it would never fire when running inside Hermes)."""
    agent_dir = tmp_path / "agent"
    agent_dir.mkdir()
    (agent_dir / "__init__.py").write_text("", encoding="utf-8")
    (agent_dir / "redact.py").write_text(
        "def redact_for_egress(text):\n    return text.replace('secret', '[REDACTED]')\n",
        encoding="utf-8",
    )
    monkeypatch.syspath_prepend(str(tmp_path))
    sys.modules.pop("agent", None)
    sys.modules.pop("agent.redact", None)
    try:
        call_jev = _CountingCallJev(_success_result())
        harness = JevShadowHarness(settings=_settings(), call_jev=call_jev)
        event = harness.decide(
            _turn(user_message="a secret value"), session_id="s1", turn_id="t1"
        )
        assert event.outcome == "success"
        assert call_jev.calls == 1
    finally:
        sys.modules.pop("agent", None)
        sys.modules.pop("agent.redact", None)


def test_success_path_computes_tier_and_metrics():
    call_jev = _CountingCallJev(_success_result(score=0.0, noul=0.1, choice="cheap"))
    harness = JevShadowHarness(settings=_settings(), call_jev=call_jev, redactor=good_redactor)
    event = harness.decide(_turn(), session_id="s1", turn_id="t1")
    assert event.outcome == "success"
    assert event.reason is None
    assert event.jev_suggested_tier == "cheap"
    assert event.current_heuristic_tier == "standard"
    assert event.match is False  # cheap != standard
    assert event.jev_difficulty_score == 0.0
    assert event.jev_difficulty_normalized == 0.0
    assert event.jev_noul == 0.1
    assert event.jev_choice == "cheap"
    assert event.jev_confidence == pytest.approx(min(1.0, 0.8))
    assert event.cost_usd == pytest.approx(100 * 0.042 / 1e6)
    assert event.latency_ms == 12.5
    assert event.input_tokens == 100
    assert call_jev.calls == 1


def test_success_path_match_true_when_suggested_equals_standard():
    call_jev = _CountingCallJev(_success_result(score=1.5, noul=0.5, choice="standard"))
    harness = JevShadowHarness(settings=_settings(), call_jev=call_jev, redactor=good_redactor)
    event = harness.decide(_turn(), session_id="s1", turn_id="t1")
    assert event.jev_suggested_tier == "standard"
    assert event.match is True


@pytest.mark.parametrize(
    "reason",
    [
        "timeout",
        "transport_error",
        "authentication",
        "payment_required",
        "rate_limited",
        "http_error",
        "response_too_large",
        "invalid_response",
    ],
)
def test_client_failure_becomes_error_event_without_raising(reason):
    failure = JevResult(
        ok=False,
        answers=None,
        input_tokens=None,
        cost_usd=None,
        latency_ms=5.0,
        http_status=None,
        reason=reason,
    )
    call_jev = _CountingCallJev(failure)
    harness = JevShadowHarness(settings=_settings(), call_jev=call_jev, redactor=good_redactor)
    event = harness.decide(_turn(), session_id="s1", turn_id="t1")
    assert event.outcome == "error"
    assert event.reason == reason
    assert event.current_heuristic_tier == "standard"
    assert event.jev_suggested_tier is None
    assert event.match is False


def test_unexpected_exception_from_client_becomes_internal_error():
    call_jev = _CountingCallJev(raises=True)
    harness = JevShadowHarness(settings=_settings(), call_jev=call_jev, redactor=good_redactor)
    event = harness.decide(_turn(), session_id="s1", turn_id="t1")
    assert event.outcome == "error"
    assert event.reason == "internal_error"


def test_decide_never_raises_across_all_branches():
    scenarios = [
        (_settings(enabled=False), good_redactor, _CountingCallJev(raises=True)),
        (_settings(api_key=None), good_redactor, _CountingCallJev(raises=True)),
        (_settings(), None, _CountingCallJev(raises=True)),
        (_settings(), leaky_redactor, _CountingCallJev(raises=True)),
        (_settings(), good_redactor, _CountingCallJev(_success_result())),
        (_settings(), good_redactor, _CountingCallJev(raises=True)),
    ]
    for settings, redactor, call_jev in scenarios:
        harness = JevShadowHarness(settings=settings, call_jev=call_jev, redactor=redactor)
        event = harness.decide(_turn(), session_id="s1", turn_id="t1")
        assert event.current_heuristic_tier == "standard"
        assert event.outcome in ("success", "skipped", "error")


def test_sink_receives_event_when_configured(tmp_path: Path):
    path = tmp_path / "events.jsonl"
    sink = ShadowEventSink(path)
    call_jev = _CountingCallJev(_success_result())
    harness = JevShadowHarness(
        settings=_settings(), call_jev=call_jev, sink=sink, redactor=good_redactor
    )
    harness.decide(_turn(), session_id="s1", turn_id="t1")
    lines = path.read_text(encoding="utf-8").splitlines()
    assert len(lines) == 1


def test_credential_bearing_turn_never_reaches_events_file_or_wire(tmp_path, make_server):
    path = tmp_path / "events.jsonl"
    sink = ShadowEventSink(path)

    def response_provider():
        body = json.dumps(
            {
                "model": "jev-1.13.0",
                "answers": {
                    QUESTION_DIFFICULTY: {"type": "score", "score": 0.0, "confidence": 1.0},
                    QUESTION_NOUL: {"type": "noul", "noul": 0.1},
                    QUESTION_TIER_CHOICE: {"type": "choice", "choice": "cheap", "confidence": 0.8},
                },
                "usage": {"input_tokens": 10},
            }
        ).encode("utf-8")
        return 200, body, {"Content-Type": "application/json"}

    server = make_server(response_provider)
    credential = "sk-abcdefghijklmnopqrstuvwxyz1234567890"
    turn = _turn(
        user_message=f"here is my key: {credential} please use it Bearer {credential}",
    )
    settings = _settings(endpoint=endpoint_for(server))
    harness = JevShadowHarness(settings=settings, sink=sink, redactor=good_redactor)

    event = harness.decide(turn, session_id="s1", turn_id="t1")

    assert event.outcome == "success"
    assert server.request_count == 1
    for body in server.received_bodies:
        assert credential not in body.decode("utf-8")

    events_raw = path.read_text(encoding="utf-8")
    assert credential not in events_raw
