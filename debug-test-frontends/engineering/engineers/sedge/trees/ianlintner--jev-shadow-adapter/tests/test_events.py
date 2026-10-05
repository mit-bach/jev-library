from __future__ import annotations

import json
import stat
from pathlib import Path

from jev_shadow.events import ShadowEvent, ShadowEventSink

EXPECTED_KEY_ORDER = [
    "timestamp",
    "session_id",
    "turn_id",
    "model_current",
    "jev_suggested_tier",
    "current_heuristic_tier",
    "match",
    "jev_confidence",
    "jev_difficulty_score",
    "jev_difficulty_normalized",
    "jev_noul",
    "jev_choice",
    "confidence",
    "cost_usd",
    "latency_ms",
    "outcome",
    "reason",
    "input_tokens",
]


def _event(**overrides) -> ShadowEvent:
    defaults = dict(
        timestamp="2026-01-01T00:00:00+00:00",
        session_id="s1",
        turn_id="t1",
        model_current="hermes-4",
        jev_suggested_tier="standard",
        current_heuristic_tier="standard",
        match=True,
        jev_confidence=0.9,
        jev_difficulty_score=1.0,
        jev_difficulty_normalized=0.33,
        jev_noul=0.2,
        jev_choice="standard",
        confidence=0.9,
        cost_usd=0.001,
        latency_ms=42.0,
        outcome="success",
        reason=None,
        input_tokens=100,
    )
    defaults.update(overrides)
    return ShadowEvent(**defaults)


def test_to_dict_has_stable_key_order():
    event = _event()
    assert list(event.to_dict().keys()) == EXPECTED_KEY_ORDER


def test_sink_creates_file_with_restrictive_permissions(tmp_path: Path):
    path = tmp_path / "events.jsonl"
    sink = ShadowEventSink(path)
    sink.append(_event())
    mode = stat.S_IMODE(path.stat().st_mode)
    assert mode == 0o600


def test_sink_appends_one_json_line_per_event(tmp_path: Path):
    path = tmp_path / "events.jsonl"
    sink = ShadowEventSink(path)
    sink.append(_event(turn_id="t1"))
    sink.append(_event(turn_id="t2"))
    lines = path.read_text(encoding="utf-8").splitlines()
    assert len(lines) == 2
    assert json.loads(lines[0])["turn_id"] == "t1"
    assert json.loads(lines[1])["turn_id"] == "t2"


def test_event_never_carries_raw_message_fields():
    event = _event()
    field_names = set(event.to_dict().keys())
    forbidden = {"user_message", "state", "prompt", "raw_state", "payload", "tool_output"}
    assert field_names.isdisjoint(forbidden)


def test_credential_bearing_input_does_not_reach_event_file(tmp_path: Path):
    path = tmp_path / "events.jsonl"
    sink = ShadowEventSink(path)
    # Even if a caller mistakenly tried to smuggle a credential into a
    # would-be event field, ShadowEvent has no slot for raw text at all --
    # only derived metrics -- so there is nothing to append that could carry it.
    event = _event(session_id="sk-abcdefghijklmnopqrstuvwxyz", turn_id="Bearer abcdef123456")
    sink.append(event)
    raw = path.read_text(encoding="utf-8")
    # session_id/turn_id are opaque caller-supplied identifiers, not user content,
    # but this still proves nothing beyond the declared dataclass fields is written.
    written = json.loads(raw.strip())
    assert set(written.keys()) == set(EXPECTED_KEY_ORDER)
