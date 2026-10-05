from __future__ import annotations

from jev_shadow.review_router import (
    COMPLEXITY_CRITERIA,
    ReviewChange,
    build_questions,
    build_state,
    suggest_review_tier,
)


def _change(**overrides) -> ReviewChange:
    defaults = dict(
        title="Add rate limiting",
        description="Adds per-tenant rate limiting to the API gateway.",
        files_touched=("gateway.py", "tests/test_gateway.py"),
        additions=120,
        deletions=10,
        language="python",
        has_tests=True,
        touches_auth=True,
        touches_network=True,
    )
    defaults.update(overrides)
    return ReviewChange(**defaults)


def test_build_state_contains_bounded_shape():
    change = _change(additions=120, deletions=10, touches_auth=True)
    state = build_state(change)
    assert state["change"]["title"] == "Add rate limiting"
    assert state["change"]["files_touched"] == ["gateway.py", "tests/test_gateway.py"]
    assert state["shape"]["additions"] == 120
    assert state["shape"]["deletions"] == 10
    assert state["shape"]["has_tests"] is True
    assert state["shape"]["touches_auth"] is True
    assert state["shape"]["touches_network"] is True


def test_build_state_defaults_do_not_expose_anything():
    state = build_state(ReviewChange())
    assert state["shape"]["additions"] == 0
    assert state["shape"]["touches_auth"] is False
    assert state["change"]["files_touched"] == []


def test_build_questions_has_the_three_expected_ids():
    questions = build_questions()
    assert set(questions) == {"complexity", "security_sensitivity", "suggested_review_tier"}
    assert questions["complexity"]["type"] == "score"
    assert questions["complexity"]["criteria"] == list(COMPLEXITY_CRITERIA)
    assert questions["security_sensitivity"]["type"] == "noul"
    assert questions["suggested_review_tier"]["type"] == "choice"
    assert set(questions["suggested_review_tier"]["criteria"]) == {"cheap", "standard", "strong"}


def test_suggest_review_tier_cheap_region():
    assert suggest_review_tier(normalized_complexity=0.0, security_noul=0.0) == "cheap"
    assert suggest_review_tier(normalized_complexity=0.5, security_noul=0.4) == "cheap"


def test_suggest_review_tier_just_above_cheap_threshold_is_standard():
    assert suggest_review_tier(normalized_complexity=0.51, security_noul=0.4) == "standard"
    assert suggest_review_tier(normalized_complexity=0.5, security_noul=0.41) == "standard"


def test_suggest_review_tier_strong_by_complexity():
    assert suggest_review_tier(normalized_complexity=0.83, security_noul=0.0) == "strong"
    assert suggest_review_tier(normalized_complexity=1.0, security_noul=0.0) == "strong"


def test_suggest_review_tier_strong_by_security_noul_only():
    assert suggest_review_tier(normalized_complexity=0.0, security_noul=0.7) == "strong"
    assert suggest_review_tier(normalized_complexity=0.0, security_noul=1.0) == "strong"


def test_suggest_review_tier_middle_region_is_standard():
    assert suggest_review_tier(normalized_complexity=0.7, security_noul=0.5) == "standard"


def test_suggest_review_tier_choice_can_escalate_but_never_deescalate():
    assert (
        suggest_review_tier(normalized_complexity=0.0, security_noul=0.0, choice="strong")
        == "strong"
    )
    assert (
        suggest_review_tier(normalized_complexity=1.0, security_noul=0.0, choice="cheap")
        == "strong"
    )
    assert (
        suggest_review_tier(normalized_complexity=0.7, security_noul=0.5, choice="standard")
        == "standard"
    )
