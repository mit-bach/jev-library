from __future__ import annotations

from jev_shadow.decision import (
    DIFFICULTY_CRITERIA,
    Turn,
    build_questions,
    build_state,
    current_heuristic_tier,
    suggest_tier,
)


def _turn(**overrides) -> Turn:
    defaults = dict(
        user_message="hello",
        current_model="hermes-4",
        available_models=("hermes-4-mini", "hermes-4", "hermes-4-pro"),
    )
    defaults.update(overrides)
    return Turn(**defaults)


def test_current_heuristic_tier_is_always_standard():
    assert current_heuristic_tier(_turn()) == "standard"
    other = _turn(user_message="anything at all", tool_count=99)
    assert current_heuristic_tier(other) == "standard"


def test_build_state_contains_bounded_turn_context():
    turn = _turn(turn_number=3, tool_count=2, has_skills_loaded=True, active_skills=("a", "b"))
    state = build_state(turn)
    assert state["current_model"] == "hermes-4"
    assert state["user_message"] == "hello"
    assert state["turn_context"]["turn_number"] == 3
    assert state["turn_context"]["tool_count"] == 2
    assert state["turn_context"]["has_skills_loaded"] is True
    assert state["turn_context"]["active_skills"] == ["a", "b"]


def test_build_questions_has_the_three_expected_ids():
    questions = build_questions()
    assert set(questions) == {"difficulty", "needs_specialized_reasoning", "suggested_tier"}
    assert questions["difficulty"]["type"] == "score"
    assert questions["difficulty"]["criteria"] == list(DIFFICULTY_CRITERIA)
    assert questions["needs_specialized_reasoning"]["type"] == "noul"
    assert questions["suggested_tier"]["type"] == "choice"
    assert set(questions["suggested_tier"]["criteria"]) == {"cheap", "standard", "strong"}


def test_suggest_tier_cheap_region():
    assert suggest_tier(normalized_difficulty=0.0, noul=0.0) == "cheap"
    assert suggest_tier(normalized_difficulty=0.5, noul=0.4) == "cheap"


def test_suggest_tier_just_above_cheap_threshold_is_standard():
    assert suggest_tier(normalized_difficulty=0.51, noul=0.4) == "standard"
    assert suggest_tier(normalized_difficulty=0.5, noul=0.41) == "standard"


def test_suggest_tier_strong_region_by_difficulty():
    assert suggest_tier(normalized_difficulty=0.83, noul=0.0) == "strong"
    assert suggest_tier(normalized_difficulty=1.0, noul=0.0) == "strong"


def test_suggest_tier_strong_region_by_noul_only():
    assert suggest_tier(normalized_difficulty=0.0, noul=0.7) == "strong"
    assert suggest_tier(normalized_difficulty=0.0, noul=1.0) == "strong"


def test_suggest_tier_just_below_strong_noul_threshold_is_standard():
    assert suggest_tier(normalized_difficulty=0.6, noul=0.69) == "standard"


def test_suggest_tier_middle_region_is_standard():
    assert suggest_tier(normalized_difficulty=0.7, noul=0.5) == "standard"


def test_suggest_tier_choice_can_escalate_but_never_deescalate():
    # base would be "cheap"; choice says "strong" -> escalate to the stricter tier.
    assert suggest_tier(normalized_difficulty=0.0, noul=0.0, choice="strong") == "strong"
    # base would be "strong"; choice says "cheap" -> stay at the stricter "strong".
    assert suggest_tier(normalized_difficulty=1.0, noul=0.0, choice="cheap") == "strong"
    # base "standard"; choice "standard" -> unchanged.
    assert suggest_tier(normalized_difficulty=0.7, noul=0.5, choice="standard") == "standard"
