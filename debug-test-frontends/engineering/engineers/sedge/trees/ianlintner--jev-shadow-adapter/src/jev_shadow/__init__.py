"""Shadow-mode TypeSafe Jev routing adapter for Hermes. Observational only.

Nothing imported from this package makes, mutates, or blocks a production
routing decision. See the repository ``AGENTS.md`` and ``README.md``.
"""

from .config import SecretKey, Settings, resolve_api_key
from .decision import Turn, current_heuristic_tier, suggest_tier
from .events import ShadowEvent, ShadowEventSink
from .harness import JevShadowHarness

__all__ = [
    "JevShadowHarness",
    "SecretKey",
    "Settings",
    "ShadowEvent",
    "ShadowEventSink",
    "Turn",
    "current_heuristic_tier",
    "resolve_api_key",
    "suggest_tier",
]

__version__ = "0.1.0"
