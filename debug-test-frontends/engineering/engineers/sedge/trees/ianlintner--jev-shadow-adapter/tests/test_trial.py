from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

from jev_shadow.trial import run

_EXAMPLES_TURNS = Path(__file__).resolve().parent.parent / "examples" / "turns.jsonl"


def _write_turns(path: Path) -> None:
    records = [
        {
            "session_id": "demo",
            "turn_id": "turn-1",
            "user_message": "hello",
            "current_model": "hermes-4",
            "available_models": ["hermes-4-mini", "hermes-4"],
        },
        {
            "session_id": "demo",
            "turn_id": "turn-2",
            "user_message": "a much harder multi-step reasoning question about distributed systems",
            "current_model": "hermes-4",
            "available_models": ["hermes-4-mini", "hermes-4"],
            "tool_count": 4,
        },
    ]
    with path.open("w", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record) + "\n")


def _write_fake_hermes_agent_root(root: Path) -> None:
    """A minimal `agent.redact` module: enough to resolve, never a real bridge."""
    agent_dir = root / "agent"
    agent_dir.mkdir()
    (agent_dir / "__init__.py").write_text("", encoding="utf-8")
    (agent_dir / "redact.py").write_text(
        "def redact_for_egress(text):\n    return text\n", encoding="utf-8"
    )


def _clear_agent_modules() -> None:
    sys.modules.pop("agent", None)
    sys.modules.pop("agent.redact", None)


def test_dry_run_with_resolved_redactor_writes_success_events(tmp_path: Path):
    """The documented dry-run path must actually exercise redaction + tier
    mapping when a redactor is available -- not silently skip every turn."""
    agent_root = tmp_path / "hermes-agent"
    agent_root.mkdir()
    _write_fake_hermes_agent_root(agent_root)
    out_path = tmp_path / "events.jsonl"

    _clear_agent_modules()
    try:
        summary = run(
            [
                "--turns",
                str(_EXAMPLES_TURNS),
                "--out",
                str(out_path),
                "--hermes-agent-root",
                str(agent_root),
            ]
        )
    finally:
        _clear_agent_modules()
        if str(agent_root) in sys.path:
            sys.path.remove(str(agent_root))

    assert out_path.exists()
    lines = out_path.read_text(encoding="utf-8").splitlines()
    assert len(lines) == 5
    for line in lines:
        event = json.loads(line)
        assert event["reason"] not in ("timeout", "transport_error", "http_error")

    assert summary["outcome_counts"].get("success") == 5
    assert summary["match_rate"] is not None


def test_dry_run_exits_nonzero_when_no_redactor_available(tmp_path: Path, monkeypatch):
    """A dry-run that can't resolve any redactor must fail loudly rather than
    silently writing skipped-only events -- that would make the trial look
    like it ran when it never exercised redaction or tier mapping at all."""
    turns_path = tmp_path / "turns.jsonl"
    out_path = tmp_path / "events.jsonl"
    _write_turns(turns_path)

    _clear_agent_modules()
    monkeypatch.delenv("HERMES_AGENT_ROOT", raising=False)
    monkeypatch.setenv("JEV_SHADOW_ALLOW_AMBIENT", "false")

    with pytest.raises(SystemExit) as exc_info:
        run(["--turns", str(turns_path), "--out", str(out_path)])

    assert exc_info.value.code != 0
    assert not out_path.exists()


def test_limit_caps_number_of_turns_processed(tmp_path: Path):
    turns_path = tmp_path / "turns.jsonl"
    out_path = tmp_path / "events.jsonl"
    _write_turns(turns_path)
    agent_root = tmp_path / "hermes-agent"
    agent_root.mkdir()
    _write_fake_hermes_agent_root(agent_root)

    _clear_agent_modules()
    try:
        summary = run(
            [
                "--turns",
                str(turns_path),
                "--out",
                str(out_path),
                "--limit",
                "1",
                "--hermes-agent-root",
                str(agent_root),
            ]
        )
    finally:
        _clear_agent_modules()
        if str(agent_root) in sys.path:
            sys.path.remove(str(agent_root))

    assert summary["total_turns"] == 1


def test_summary_contains_no_prompt_text(tmp_path: Path):
    turns_path = tmp_path / "turns.jsonl"
    out_path = tmp_path / "events.jsonl"
    _write_turns(turns_path)
    agent_root = tmp_path / "hermes-agent"
    agent_root.mkdir()
    _write_fake_hermes_agent_root(agent_root)

    _clear_agent_modules()
    try:
        summary = run(
            [
                "--turns",
                str(turns_path),
                "--out",
                str(out_path),
                "--hermes-agent-root",
                str(agent_root),
            ]
        )
    finally:
        _clear_agent_modules()
        if str(agent_root) in sys.path:
            sys.path.remove(str(agent_root))

    dumped = json.dumps(summary)
    assert "hello" not in dumped
    assert "distributed systems" not in dumped
