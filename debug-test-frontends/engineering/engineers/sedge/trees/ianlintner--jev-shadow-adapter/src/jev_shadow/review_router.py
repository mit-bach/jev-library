"""Review-tier routing for pull requests: state/state builder + Jev question set.

Mirrors the turn-tier routing in :mod:`jev_shadow.decision` but for a code
review, not a chat turn. Observational only: :func:`suggest_review_tier`
returns a *suggestion*; nothing here mutates, routes, or blocks a real
workflow. The review tier names a model family for the review subagent; the
mapping from tier name to a concrete provider/model is the caller's concern
and is not shipped inside this module.
"""

from __future__ import annotations

from dataclasses import dataclass

#: Question ids.
QUESTION_COMPLEXITY = "complexity"
QUESTION_SECURITY_SENSITIVITY = "security_sensitivity"
QUESTION_TIER_CHOICE = "suggested_review_tier"

#: Ordered complexity levels. Jev's "score" answer is a FRACTIONAL INDEX into
#: this list (0.0 == first level == "Low"), consistent with the turn router.
COMPLEXITY_CRITERIA: tuple[str, ...] = (
    "Low: small, mechanical change; a cheap model can review it well.",
    "Medium: focused change touching a few files; some reasoning needed.",
    "High: cross-cutting change with subtle interactions; strong model needed.",
    "Expert: broad or security-critical change; the strongest model is warranted.",
)

#: Review tiers. Names the *capability class*, not a provider or a model id.
#: The caller maps a tier to a concrete model (e.g. haiku / sonnet / sol).
TIER_CRITERIA: dict[str, str] = {
    "cheap": "A small, fast, cheap model can review this change adequately.",
    "standard": "A mid-tier model is the right capability/cost balance for this review.",
    "strong": "This review needs the strongest available model.",
}

TIER_ORDER: dict[str, int] = {"cheap": 0, "standard": 1, "strong": 2}

#: Uncalibrated, conservative thresholds for the shadow trial. Not fit against
#: outcome data; they make the suggestion a concrete, testable function.
CHEAP_MAX_NORMALIZED_COMPLEXITY = 0.5
CHEAP_MAX_SECURITY_NOUL = 0.4
STRONG_MIN_NORMALIZED_COMPLEXITY = 0.83
STRONG_MIN_SECURITY_NOUL = 0.7


@dataclass(frozen=True)
class ReviewChange:
    """A code change to route. Only bounded, structured fields go to Jev."""

    title: str = ""
    description: str = ""
    files_touched: tuple[str, ...] = ()
    additions: int = 0
    deletions: int = 0
    language: str = ""
    has_tests: bool = False
    touches_auth: bool = False
    touches_network: bool = False
    touches_dependencies: bool = False


def build_state(change: ReviewChange) -> dict:
    """Build the review-routing state for a change.

    ``title``/``description`` are included raw here; the harness redacts the
    entire serialized state before leaving the process, so this dict must not
    be used to send anything on its own.
    """
    return {
        "change": {
            "title": change.title,
            "description": change.description,
            "files_touched": list(change.files_touched),
        },
        "shape": {
            "additions": int(change.additions),
            "deletions": int(change.deletions),
            "language": change.language,
            "has_tests": bool(change.has_tests),
            "touches_auth": bool(change.touches_auth),
            "touches_network": bool(change.touches_network),
            "touches_dependencies": bool(change.touches_dependencies),
        },
    }


def build_questions() -> dict:
    """Build the Jev question set for a shadow review-tier judgement.

    Three questions:
      - ``complexity`` (score, 4 ordered levels): fractional index into
        :data:`COMPLEXITY_CRITERIA`; normalize with
        ``score / (len(COMPLEXITY_CRITERIA) - 1)``.
      - ``security_sensitivity`` (noul): probability [0, 1] the change touches
        auth/boundary/crypto/fixtures and deserves security-focused review.
      - ``suggested_review_tier`` (choice): Jev's own tier pick, used as a
        conservative upper bound in :func:`suggest_review_tier`.
    """
    return {
        QUESTION_COMPLEXITY: {
            "type": "score",
            "instructions": (
                "Rate the complexity of this code change for a reviewer to "
                "assess correctly, considering scope, interaction between "
                "components, and how much context a reviewer must hold."
            ),
            "criteria": list(COMPLEXITY_CRITERIA),
        },
        QUESTION_SECURITY_SENSITIVITY: {
            "type": "noul",
            "instructions": (
                "Return the probability that this change touches "
                "authentication, authorization, secret handling, user input, "
                "network boundaries, cryptography, or dependency/trust updates "
                "that warrant dedicated security review."
            ),
        },
        QUESTION_TIER_CHOICE: {
            "type": "choice",
            "instructions": (
                "Choose the review tier best suited to assess this change "
                "correctly, without over- or under-provisioning capability."
            ),
            "criteria": dict(TIER_CRITERIA),
        },
    }


def suggest_review_tier(
    *,
    normalized_complexity: float,
    security_noul: float,
    choice: str | None = None,
) -> str:
    """Suggest a review tier from Jev's answers. Observational only.

    ``normalized_complexity`` and ``security_noul`` decide a base tier via
    fixed, uncalibrated thresholds. A ``choice`` naming a *stricter* tier wins
    (never silently downgrades a strong signal). A pure function of the three
    answers.
    """
    if (
        normalized_complexity <= CHEAP_MAX_NORMALIZED_COMPLEXITY
        and security_noul <= CHEAP_MAX_SECURITY_NOUL
    ):
        base = "cheap"
    elif (
        normalized_complexity >= STRONG_MIN_NORMALIZED_COMPLEXITY
        or security_noul >= STRONG_MIN_SECURITY_NOUL
    ):
        base = "strong"
    else:
        base = "standard"

    if choice in TIER_ORDER and TIER_ORDER[choice] > TIER_ORDER[base]:
        return choice
    return base
