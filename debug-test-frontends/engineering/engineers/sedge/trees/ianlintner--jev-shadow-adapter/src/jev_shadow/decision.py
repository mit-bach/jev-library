"""Tier mapping, the current production heuristic, and Jev prompt building.

Nothing in this module makes a production decision: :func:`suggest_tier`
produces an observational suggestion only, and :func:`current_heuristic_tier`
documents what the existing Hermes logic actually does today.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass, field

QUESTION_DIFFICULTY = "difficulty"
QUESTION_NOUL = "needs_specialized_reasoning"
QUESTION_TIER_CHOICE = "suggested_tier"

#: Ordered difficulty levels. Jev's "score" answer is a FRACTIONAL INDEX into
#: this list (0.0 == first level == "Low"), not a 1-based scale.
DIFFICULTY_CRITERIA: tuple[str, ...] = (
    "Low: single-step, unambiguous, directly answerable from common patterns.",
    "Medium: a few reasoning steps or minor ambiguity, still routine.",
    "High: multi-step reasoning, unfamiliar structure, or notable ambiguity.",
    "Expert: deep domain expertise, complex multi-step planning, or high-stakes ambiguity.",
)

TIER_CRITERIA: dict[str, str] = {
    "cheap": "Trivial or routine turn; a small/cheap model should handle it well.",
    "standard": "Everyday turn with some reasoning; the default mid-tier model is appropriate.",
    "strong": "Demanding turn that needs the strongest available model.",
}

TIER_ORDER: dict[str, int] = {"cheap": 0, "standard": 1, "strong": 2}

# Uncalibrated, conservative thresholds for a *shadow* trial only. These were
# not fit against outcome data; they exist to give the shadow comparison a
# concrete, testable mapping, not to be trusted as a real routing policy.
CHEAP_MAX_NORMALIZED_DIFFICULTY = 0.5
CHEAP_MAX_NOUL = 0.4
STRONG_MIN_NORMALIZED_DIFFICULTY = 0.83
STRONG_MIN_NOUL = 0.7


@dataclass(frozen=True)
class Turn:
    """A Hermes-shaped turn. Only the fields the harness actually needs."""

    user_message: str
    current_model: str
    available_models: Sequence[str] = ()
    turn_number: int = 0
    tool_count: int = 0
    has_skills_loaded: bool = False
    active_skills: Sequence[str] = field(default_factory=tuple)
    has_multimodal: bool = False
    task_category_hint: str | None = None


def build_state(turn: Turn) -> dict:
    """Build the model-tier-routing state for a turn.

    ``user_message`` is included raw here; the harness redacts the *entire*
    serialized state (this dict, JSON-dumped) before anything leaves the
    process, so this function must not be used to send data anywhere on its
    own. ``turn_context`` is intentionally small and structured (counts,
    flags, short strings) rather than raw tool output or history, which keeps
    the state well under the configured byte cap for ordinary turns.
    """
    return {
        "current_model": turn.current_model,
        "available_models": list(turn.available_models),
        "user_message": turn.user_message,
        "turn_context": {
            "turn_number": int(turn.turn_number),
            "tool_count": int(turn.tool_count),
            "has_skills_loaded": bool(turn.has_skills_loaded),
            "active_skills": list(turn.active_skills),
            "has_multimodal": bool(turn.has_multimodal),
            "task_category_hint": turn.task_category_hint,
        },
    }


def build_questions() -> dict:
    """Build the Jev question set for a shadow difficulty/tier judgement.

    Three questions:
      - ``difficulty`` (score, 4 ordered levels): Jev returns a fractional
        index into :data:`DIFFICULTY_CRITERIA`; normalize with
        ``score / (len(DIFFICULTY_CRITERIA) - 1)`` before comparing to
        thresholds.
      - ``needs_specialized_reasoning`` (noul): probability [0, 1] that the
        turn needs deliberate reasoning rather than pattern matching.
      - ``suggested_tier`` (choice, optional third signal): Jev's own direct
        tier pick, used as a conservative upper bound in :func:`suggest_tier`.
    """
    return {
        QUESTION_DIFFICULTY: {
            "type": "score",
            "instructions": (
                "Rate how difficult this turn is for a language model to handle "
                "well, selecting the criteria level that best matches the "
                "required reasoning depth, ambiguity, and domain knowledge."
            ),
            "criteria": list(DIFFICULTY_CRITERIA),
        },
        QUESTION_NOUL: {
            "type": "noul",
            "instructions": (
                "Return the probability that this turn requires deep, "
                "deliberate reasoning (multi-step logic, planning, or careful "
                "analysis) rather than simple pattern matching or recall."
            ),
        },
        QUESTION_TIER_CHOICE: {
            "type": "choice",
            "instructions": (
                "Choose the model tier best suited to answer this turn well, "
                "without over- or under-provisioning capability."
            ),
            "criteria": dict(TIER_CRITERIA),
        },
    }


def suggest_tier(
    *,
    normalized_difficulty: float,
    noul: float,
    choice: str | None = None,
) -> str:
    """Suggest a model tier from Jev's answers. Observational only.

    ``normalized_difficulty`` and ``noul`` decide a base tier via fixed,
    uncalibrated thresholds. If the optional ``choice`` question named a
    *stricter* tier than the base, the stricter one wins -- this keeps the
    combination conservative (never silently downgrades a strong signal from
    one question because another question looked mild) and keeps the mapping
    a pure, testable function of the three answers.
    """
    if normalized_difficulty <= CHEAP_MAX_NORMALIZED_DIFFICULTY and noul <= CHEAP_MAX_NOUL:
        base = "cheap"
    elif normalized_difficulty >= STRONG_MIN_NORMALIZED_DIFFICULTY or noul >= STRONG_MIN_NOUL:
        base = "strong"
    else:
        base = "standard"

    if choice in TIER_ORDER and TIER_ORDER[choice] > TIER_ORDER[base]:
        return choice
    return base


def current_heuristic_tier(turn: Turn) -> str:
    """What today's production logic actually picks for this turn.

    In this spike, that is unconditionally "standard": Hermes uses a single
    static default model for every turn unless a caller explicitly overrides
    it, so there is no per-turn heuristic to evaluate yet. This function
    exists (rather than a hardcoded literal at call sites) so the shadow
    comparison stays honest if that production behavior ever changes.
    """
    del turn  # unused: the current heuristic does not look at the turn at all
    return "standard"
