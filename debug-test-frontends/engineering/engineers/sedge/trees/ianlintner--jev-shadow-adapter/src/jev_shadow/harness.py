"""The orchestrator: a Hermes turn in, a shadow event out. Never mutates.

Every branch below -- disabled, kill-switched, missing credential, missing
redactor, insufficient redaction, oversize state, network failure, malformed
response, or a clean success -- ends the same way: a :class:`ShadowEvent` is
built and returned (and, if a sink was given, appended to it). Nothing here
ever raises out to the caller, and nothing here ever returns anything that
could be mistaken for a production routing decision: ``current_heuristic_tier``
on the returned event is always the untouched, existing heuristic.
"""

from __future__ import annotations

import asyncio
import contextlib
import json
from collections.abc import Callable
from datetime import UTC, datetime

from . import client as client_module
from . import decision
from .client import JevResult
from .config import Settings
from .events import ShadowEvent, ShadowEventSink
from .metrics import ShadowMetrics
from .redaction import RedactorFn, redact_outbound_state, resolve_redactor

ClockFn = Callable[[], datetime]
CallJevFn = Callable[..., JevResult]


class JevShadowHarness:
    """Runs the shadow comparison for one turn at a time. Fully injectable."""

    def __init__(
        self,
        settings: Settings,
        *,
        call_jev: CallJevFn | None = None,
        sink: ShadowEventSink | None = None,
        metrics: ShadowMetrics | None = None,
        redactor: RedactorFn | None = None,
        clock: ClockFn | None = None,
    ) -> None:
        self._settings = settings
        self._call_jev = call_jev or client_module.call_jev
        self._sink = sink
        self._metrics = metrics
        self._redactor = redactor
        self._clock = clock or (lambda: datetime.now(UTC))

    def decide(self, turn: decision.Turn, *, session_id: str, turn_id: str) -> ShadowEvent:
        """Run the shadow comparison for one turn. Never raises."""
        heuristic_tier = decision.current_heuristic_tier(turn)

        def skipped(reason: str) -> ShadowEvent:
            return self._emit(
                session_id=session_id,
                turn_id=turn_id,
                model_current=turn.current_model,
                heuristic_tier=heuristic_tier,
                outcome="skipped",
                reason=reason,
            )

        if not self._settings.enabled:
            return skipped("disabled")
        if self._settings.kill_switch_active():
            return skipped("kill_switch")
        if self._settings.api_key is None:
            return skipped("missing_credential")

        try:
            resolved_redactor = resolve_redactor(
                redactor=self._redactor,
                hermes_agent_root=self._settings.hermes_agent_root,
                allow_ambient=self._settings.allow_ambient,
            )
        except Exception:
            return skipped("redaction_unavailable")

        try:
            state = decision.build_state(turn)
            serialized_state = json.dumps(state)
        except Exception:
            return skipped("internal_error")

        redaction_outcome = redact_outbound_state(
            serialized_state,
            redactor=resolved_redactor,
            max_bytes=self._settings.max_state_bytes,
        )
        if not redaction_outcome.ok:
            return skipped(redaction_outcome.reason or "redaction_unavailable")

        try:
            questions = decision.build_questions()
            result = self._call_jev(
                endpoint=self._settings.endpoint,
                api_key=self._settings.api_key,
                model=self._settings.model,
                state_text=redaction_outcome.text,
                questions=questions,
                timeout_seconds=self._settings.timeout_seconds,
            )
        except Exception:
            return self._emit(
                session_id=session_id,
                turn_id=turn_id,
                model_current=turn.current_model,
                heuristic_tier=heuristic_tier,
                outcome="error",
                reason="internal_error",
            )

        if not result.ok:
            return self._emit(
                session_id=session_id,
                turn_id=turn_id,
                model_current=turn.current_model,
                heuristic_tier=heuristic_tier,
                outcome="error",
                reason=result.reason,
                latency_ms=result.latency_ms,
            )

        return self._emit_success(
            session_id=session_id,
            turn_id=turn_id,
            model_current=turn.current_model,
            heuristic_tier=heuristic_tier,
            result=result,
        )

    async def async_decide(
        self, turn: decision.Turn, *, session_id: str, turn_id: str
    ) -> ShadowEvent:
        """Off-critical-path wrapper. Runs :meth:`decide` in a worker thread."""
        return await asyncio.to_thread(self.decide, turn, session_id=session_id, turn_id=turn_id)

    def _emit_success(
        self,
        *,
        session_id: str,
        turn_id: str,
        model_current: str,
        heuristic_tier: str,
        result: JevResult,
    ) -> ShadowEvent:
        answers = result.answers or {}
        difficulty = answers.get(decision.QUESTION_DIFFICULTY)
        noul_answer = answers.get(decision.QUESTION_NOUL)
        choice_answer = answers.get(decision.QUESTION_TIER_CHOICE)

        difficulty_score = getattr(difficulty, "score", None)
        difficulty_normalized = (
            difficulty_score / (len(decision.DIFFICULTY_CRITERIA) - 1)
            if difficulty_score is not None
            else None
        )
        noul_value = getattr(noul_answer, "noul", None)
        jev_choice = getattr(choice_answer, "choice", None)

        confidences = [
            answer.confidence
            for answer in (difficulty, choice_answer)
            if answer is not None and getattr(answer, "confidence", None) is not None
        ]
        jev_confidence = min(confidences) if confidences else None

        suggested_tier = None
        if difficulty_normalized is not None and noul_value is not None:
            suggested_tier = decision.suggest_tier(
                normalized_difficulty=difficulty_normalized,
                noul=noul_value,
                choice=jev_choice,
            )

        return self._emit(
            session_id=session_id,
            turn_id=turn_id,
            model_current=model_current,
            heuristic_tier=heuristic_tier,
            outcome="success",
            reason=None,
            suggested_tier=suggested_tier,
            jev_confidence=jev_confidence,
            jev_difficulty_score=difficulty_score,
            jev_difficulty_normalized=difficulty_normalized,
            jev_noul=noul_value,
            jev_choice=jev_choice,
            cost_usd=result.cost_usd,
            latency_ms=result.latency_ms,
            input_tokens=result.input_tokens,
        )

    def _emit(
        self,
        *,
        session_id: str,
        turn_id: str,
        model_current: str,
        heuristic_tier: str,
        outcome: str,
        reason: str | None,
        suggested_tier: str | None = None,
        jev_confidence: float | None = None,
        jev_difficulty_score: float | None = None,
        jev_difficulty_normalized: float | None = None,
        jev_noul: float | None = None,
        jev_choice: str | None = None,
        cost_usd: float | None = None,
        latency_ms: float = 0.0,
        input_tokens: int | None = None,
    ) -> ShadowEvent:
        match = suggested_tier is not None and suggested_tier == heuristic_tier
        event = ShadowEvent(
            timestamp=self._clock().isoformat(),
            session_id=session_id,
            turn_id=turn_id,
            model_current=model_current,
            jev_suggested_tier=suggested_tier,
            current_heuristic_tier=heuristic_tier,
            match=match,
            jev_confidence=jev_confidence,
            jev_difficulty_score=jev_difficulty_score,
            jev_difficulty_normalized=jev_difficulty_normalized,
            jev_noul=jev_noul,
            jev_choice=jev_choice,
            confidence=jev_confidence,
            cost_usd=cost_usd,
            latency_ms=latency_ms,
            outcome=outcome,
            reason=reason,
            input_tokens=input_tokens,
        )
        if self._sink is not None:
            self._sink.append(event)
        if self._metrics is not None:
            with contextlib.suppress(Exception):
                self._metrics.observe(event)  # Telemetry cannot change the decision path.
        return event
