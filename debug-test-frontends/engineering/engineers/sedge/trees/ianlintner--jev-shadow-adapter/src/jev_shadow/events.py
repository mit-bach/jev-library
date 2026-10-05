"""The structured shadow event and its JSONL sink.

A :class:`ShadowEvent` NEVER carries the raw user message, the raw state, the
outbound payload, or any tool output -- only derived decisions and metrics.
That is a hard invariant, not a style preference: this is the one artifact
this package writes to disk, so it is the last line of defense against a
credential or raw prompt leaking into a log file.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path

VALID_OUTCOMES = ("success", "skipped", "error")


@dataclass(frozen=True)
class ShadowEvent:
    timestamp: str
    session_id: str
    turn_id: str
    model_current: str
    jev_suggested_tier: str | None
    current_heuristic_tier: str
    match: bool
    jev_confidence: float | None
    jev_difficulty_score: float | None
    jev_difficulty_normalized: float | None
    jev_noul: float | None
    jev_choice: str | None
    confidence: float | None
    cost_usd: float | None
    latency_ms: float
    outcome: str
    reason: str | None
    input_tokens: int | None

    def to_dict(self) -> dict:
        """Render with a stable key order for JSONL output."""
        return {
            "timestamp": self.timestamp,
            "session_id": self.session_id,
            "turn_id": self.turn_id,
            "model_current": self.model_current,
            "jev_suggested_tier": self.jev_suggested_tier,
            "current_heuristic_tier": self.current_heuristic_tier,
            "match": self.match,
            "jev_confidence": self.jev_confidence,
            "jev_difficulty_score": self.jev_difficulty_score,
            "jev_difficulty_normalized": self.jev_difficulty_normalized,
            "jev_noul": self.jev_noul,
            "jev_choice": self.jev_choice,
            "confidence": self.confidence,
            "cost_usd": self.cost_usd,
            "latency_ms": self.latency_ms,
            "outcome": self.outcome,
            "reason": self.reason,
            "input_tokens": self.input_tokens,
        }


class ShadowEventSink:
    """Appends one JSON line per event to a file, created 0600."""

    def __init__(self, path: str | Path) -> None:
        self.path = Path(path)

    def append(self, event: ShadowEvent) -> None:
        line = json.dumps(event.to_dict()) + "\n"
        fd = os.open(self.path, os.O_CREAT | os.O_APPEND | os.O_WRONLY, 0o600)
        try:
            os.fchmod(fd, 0o600)
            os.write(fd, line.encode("utf-8"))
        finally:
            os.close(fd)
