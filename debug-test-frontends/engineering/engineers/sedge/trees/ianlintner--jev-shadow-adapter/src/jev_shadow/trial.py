"""``python -m jev_shadow.trial`` -- a local, explicitly opt-in shadow trial.

Reads a local JSON/JSONL file of synthetic or captured turns, runs the shadow
harness over them, and writes one :class:`~jev_shadow.events.ShadowEvent` per
turn to a JSONL file. Defaults to dry-run (no network at all -- a local
simulator stands in for the real Jev call so the redaction and tier-mapping
path still gets exercised). Real API calls require the explicit ``--live``
flag. Prints an aggregate-only summary; never prints prompts or state.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any

from .client import ChoiceAnswer, JevResult, NoulAnswer, ScoreAnswer
from .config import SecretKey, Settings
from .decision import (
    DIFFICULTY_CRITERIA,
    QUESTION_DIFFICULTY,
    QUESTION_NOUL,
    QUESTION_TIER_CHOICE,
    Turn,
)
from .events import ShadowEvent, ShadowEventSink
from .harness import JevShadowHarness
from .redaction import resolve_redactor

_DRY_RUN_PLACEHOLDER_KEY = "dry-run-placeholder-never-sent"

#: Printed (never logged as part of the aggregate summary) when no Hermes
#: redactor can be resolved. Names the exact remedy -- this is a config
#: diagnostic about the *harness's setup*, never turn content.
_REDACTOR_DIAGNOSTIC = (
    "jev-shadow: no Hermes redactor could be resolved -- every turn will be "
    "skipped with reason 'redaction_unavailable'. Fix: point HERMES_AGENT_ROOT "
    "(env var) or --hermes-agent-root at a Hermes checkout, or run this trial "
    "in-process inside Hermes, where 'agent.redact' is already importable."
)


def _redactor_is_available(settings: Settings) -> bool:
    try:
        resolved = resolve_redactor(
            hermes_agent_root=settings.hermes_agent_root,
            allow_ambient=settings.allow_ambient,
        )
    except Exception:
        return False
    return resolved is not None


def _simulated_call_jev(
    *,
    endpoint: str,
    api_key: SecretKey,
    model: str,
    state_text: str,
    questions: dict,
    timeout_seconds: float,
) -> JevResult:
    """Stand-in for :func:`jev_shadow.client.call_jev` used only in dry-run.

    Makes no network call. Derives a deterministic pseudo-answer purely from
    the length of the already-redacted ``state_text`` (never its content), so
    ``--dry-run`` still exercises the tier-mapping arithmetic without talking
    to anything or requiring a real credential.
    """
    del endpoint, api_key, timeout_seconds
    seed = len(state_text)
    normalized_difficulty = (seed % 97) / 96.0
    noul = ((seed * 31) % 101) / 100.0
    score = normalized_difficulty * (len(DIFFICULTY_CRITERIA) - 1)
    answers = {
        QUESTION_DIFFICULTY: ScoreAnswer(score=score, confidence=0.5),
        QUESTION_NOUL: NoulAnswer(noul=noul, confidence=None),
        QUESTION_TIER_CHOICE: ChoiceAnswer(choice="standard", confidence=0.5),
    }
    return JevResult(
        ok=True,
        answers=answers,
        input_tokens=0,
        cost_usd=0.0,
        latency_ms=0.0,
        http_status=None,
        reason=None,
    )


def _load_turns(path: Path) -> list[dict[str, Any]]:
    text = path.read_text(encoding="utf-8")
    stripped = text.strip()
    if not stripped:
        return []
    if stripped.startswith("["):
        data = json.loads(stripped)
        if not isinstance(data, list):
            raise ValueError("turns file must contain a JSON array or JSONL lines")
        return data
    records = []
    for line in stripped.splitlines():
        line = line.strip()
        if not line:
            continue
        records.append(json.loads(line))
    return records


def _turn_from_record(record: dict[str, Any]) -> Turn:
    return Turn(
        user_message=record.get("user_message", ""),
        current_model=record.get("current_model", "unknown"),
        available_models=tuple(record.get("available_models", ())),
        turn_number=record.get("turn_number", 0),
        tool_count=record.get("tool_count", 0),
        has_skills_loaded=record.get("has_skills_loaded", False),
        active_skills=tuple(record.get("active_skills", ())),
        has_multimodal=record.get("has_multimodal", False),
        task_category_hint=record.get("task_category_hint"),
    )


def _percentile(sorted_values: list[float], fraction: float) -> float | None:
    if not sorted_values:
        return None
    index = min(len(sorted_values) - 1, int(round(fraction * (len(sorted_values) - 1))))
    return sorted_values[index]


def summarize(events: list[ShadowEvent]) -> dict[str, Any]:
    """Aggregate-only summary: no prompts, no state, no raw text anywhere."""
    tier_counts = Counter(e.jev_suggested_tier for e in events if e.jev_suggested_tier is not None)
    outcome_counts = Counter(e.outcome for e in events)
    successes = [e for e in events if e.outcome == "success"]
    matches = sum(1 for e in successes if e.match)
    latencies = sorted(e.latency_ms for e in events)
    return {
        "total_turns": len(events),
        "tier_counts": dict(tier_counts),
        "outcome_counts": dict(outcome_counts),
        "match_rate": (matches / len(successes)) if successes else None,
        "total_cost_usd": sum(e.cost_usd or 0.0 for e in events),
        "latency_ms_p50": _percentile(latencies, 0.50),
        "latency_ms_p95": _percentile(latencies, 0.95),
    }


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m jev_shadow.trial",
        description=(
            "Run a local, offline-by-default Jev shadow trial. Jev's output is "
            "never a production decision; this only ever produces shadow events."
        ),
    )
    parser.add_argument("--turns", type=Path, required=True, help="Path to a JSON/JSONL turns file")
    parser.add_argument("--out", type=Path, required=True, help="Path to write shadow events JSONL")
    parser.add_argument("--limit", type=int, default=None, help="Only process the first N turns")
    parser.add_argument(
        "--live",
        action="store_true",
        help="Make real API calls to TypeSafe Jev. Absent by default (dry-run).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="No-op: dry-run is already the default whenever --live is absent.",
    )
    parser.add_argument(
        "--hermes-agent-root",
        type=Path,
        default=None,
        help=(
            "Path to a Hermes checkout providing agent.redact, used to resolve "
            "the real redactor for both --live and dry-run. Falls back to "
            "$HERMES_AGENT_ROOT, then an already-importable agent.redact."
        ),
    )
    return parser


def run(argv: list[str] | None = None) -> dict[str, Any]:
    args = build_arg_parser().parse_args(argv)

    records = _load_turns(args.turns)
    if args.limit is not None:
        records = records[: args.limit]

    if args.live:
        settings = Settings.from_env(hermes_agent_root=args.hermes_agent_root)
        if not _redactor_is_available(settings):
            print(_REDACTOR_DIAGNOSTIC, file=sys.stderr)
        sink = ShadowEventSink(args.out)
        harness = JevShadowHarness(settings=settings, sink=sink)
    else:
        # Dry-run must exercise the same redaction + tier-mapping path as a
        # live run (only the Jev call itself is simulated), so it resolves
        # the real redactor the same way. Unlike live mode -- which must fail
        # open and keep running -- an unresolved redactor here is a hard
        # configuration error: silently writing five skipped events would
        # make the trial look like it ran when it never exercised anything.
        settings = Settings.from_env(
            api_key=_DRY_RUN_PLACEHOLDER_KEY, hermes_agent_root=args.hermes_agent_root
        )
        if not _redactor_is_available(settings):
            print(_REDACTOR_DIAGNOSTIC, file=sys.stderr)
            raise SystemExit(2)
        sink = ShadowEventSink(args.out)
        harness = JevShadowHarness(settings=settings, call_jev=_simulated_call_jev, sink=sink)

    events: list[ShadowEvent] = []
    for index, record in enumerate(records):
        turn = _turn_from_record(record)
        session_id = str(record.get("session_id", "trial-session"))
        turn_id = str(record.get("turn_id", f"turn-{index}"))
        events.append(harness.decide(turn, session_id=session_id, turn_id=turn_id))

    return summarize(events)


def main(argv: list[str] | None = None) -> int:
    summary = run(argv)
    json.dump(summary, sys.stdout, indent=2, sort_keys=False)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
