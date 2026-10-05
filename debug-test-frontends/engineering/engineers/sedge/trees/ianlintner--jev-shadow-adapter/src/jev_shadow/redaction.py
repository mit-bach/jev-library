"""Bridge to Hermes' egress redaction, with fail-closed behavior.

The harness never invents its own secret-pattern list as a primary defense.
It borrows Hermes' existing ``agent.redact.redact_for_egress`` (which itself
runs ``redact_sensitive_text(text, force=True)`` plus a bearer-token sweep and
fails closed) and only adds a *second*, narrow, belt-and-braces check on top:
if a known credential shape still survives the real redactor's output, or no
redactor can be found at all, the export is skipped rather than sent.
"""

from __future__ import annotations

import importlib
import importlib.util
import re
import sys
from collections.abc import Callable
from pathlib import Path

RedactorFn = Callable[[str], str]

#: Minimum number of alphanumeric characters required in a redacted state
#: for it to be considered meaningful enough to export.
MIN_ALPHANUMERIC_CHARS = 8

# Belt-and-braces credential shapes. These are checked AFTER the real Hermes
# redactor has already run; a match here means the real redactor missed
# something, not that this list is a substitute for it.
#
# The last pattern (a bare `keyword=value` assignment) is the one genuinely
# load-bearing case verified against the real Hermes redactor: it truncates
# `sk-...` values and masks `Bearer ...`, but leaves a bare `password=...`
# assignment in prose fully intact (that redactor only catches secret-named
# *variable* assignments, not conversational `password=` text -- see its own
# comments). This is a coarse heuristic, not a value classifier: it only
# fires when the keyword sits immediately before `=` (so `token_limit=100` or
# `secret_name=my-app`, where another identifier sits between the keyword and
# `=`, never match) AND the value is long enough and not purely numeric (so
# `api_key=42` or `max_tokens=4096`-shaped short/numeric values pass). A
# short-but-real secret (e.g. a 6-character password) can still slip past;
# this check exists to catch what the real redactor missed, not to replace it.
_MIN_CREDENTIAL_ASSIGNMENT_VALUE_LEN = 8
_CREDENTIAL_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(r"Bearer\s+[A-Za-z0-9._\-]{16,}", re.IGNORECASE),
    re.compile(r"\bapikey_[A-Za-z0-9]{8,}", re.IGNORECASE),
    re.compile(r"\bsk-[A-Za-z0-9]{16,}"),
    re.compile(r"\bghp_[A-Za-z0-9]{16,}"),
    re.compile(r"\bAKIA[0-9A-Z]{12,}"),
    re.compile(r"-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----"),
    re.compile(
        r"\b(?:password|secret|api[_-]?key|token)\s*=\s*"
        rf"(?!\d+(?:\s|$))\S{{{_MIN_CREDENTIAL_ASSIGNMENT_VALUE_LEN},}}",
        re.IGNORECASE,
    ),
)


class RedactionOutcome:
    """Result of attempting to redact an outbound state string."""

    __slots__ = ("ok", "text", "reason")

    def __init__(self, ok: bool, text: str | None, reason: str | None) -> None:
        self.ok = ok
        self.text = text
        self.reason = reason

    @classmethod
    def success(cls, text: str) -> RedactionOutcome:
        return cls(True, text, None)

    @classmethod
    def failure(cls, reason: str) -> RedactionOutcome:
        return cls(False, None, reason)


def resolve_redactor(
    *,
    redactor: RedactorFn | None = None,
    hermes_agent_root: str | Path | None = None,
    allow_ambient: bool = False,
) -> RedactorFn | None:
    """Locate the Hermes redaction bridge, or return ``None`` if unavailable.

    Resolution order:
      1. an explicitly injected callable (tests, callers with their own bridge)
      2. ``hermes_agent_root``, imported specifically *from that root*. An
         explicit root is a caller instruction and always wins over whatever
         ``agent.redact`` module a stale ``sys.modules`` entry, or ``sys.path``
         order, would otherwise hand back.
      3. ``agent.redact.redact_for_egress`` if already importable -- but only
         when ``allow_ambient`` is set. Silently trusting whatever a host
         process happens to have imported is non-deterministic (it depends on
         what else shares the interpreter), so it is opt-in rather than the
         default: the harness never passes it, and resolution fails closed
         (returns ``None``) unless a redactor or root was explicitly given.

    Never raises; returns ``None`` (never a "best effort" callable) if nothing
    usable is found.
    """
    if redactor is not None:
        return redactor

    if hermes_agent_root:
        return _import_from_root(Path(hermes_agent_root))

    if allow_ambient:
        return _import_ambient()

    return None


def _import_ambient() -> RedactorFn | None:
    try:
        if importlib.util.find_spec("agent.redact") is None:
            return None
        module = importlib.import_module("agent.redact")
    except Exception:
        return None
    return getattr(module, "redact_for_egress", None)


def _agent_module_names() -> list[str]:
    return [name for name in sys.modules if name == "agent" or name.startswith("agent.")]


def _import_from_root(root: Path) -> RedactorFn | None:
    """Import ``agent.redact`` from a specific checkout, ignoring any other
    ``agent`` package already cached in ``sys.modules`` or found via
    ``sys.path`` order, and without leaking that substitution to the rest of
    the process once we're done.
    """
    root_dir = root.expanduser()
    if not (root_dir / "agent" / "redact.py").is_file():
        return None

    root_str = str(root_dir)
    saved_modules = {name: sys.modules[name] for name in _agent_module_names()}
    for name in saved_modules:
        del sys.modules[name]
    if root_str not in sys.path:
        sys.path.insert(0, root_str)

    try:
        if importlib.util.find_spec("agent.redact") is None:
            return None
        module = importlib.import_module("agent.redact")
        return getattr(module, "redact_for_egress", None)
    except Exception:
        return None
    finally:
        for name in _agent_module_names():
            del sys.modules[name]
        sys.modules.update(saved_modules)


def _has_surviving_credential_shape(text: str) -> bool:
    return any(pattern.search(text) for pattern in _CREDENTIAL_PATTERNS)


def _alphanumeric_count(text: str) -> int:
    return sum(1 for ch in text if ch.isalnum())


def redact_outbound_state(
    serialized_state: str,
    *,
    redactor: RedactorFn | None,
    max_bytes: int,
) -> RedactionOutcome:
    """Redact a fully-serialized outbound state string before it is sent.

    Fails closed at every step; never returns a "best effort" send:
      - no redactor resolved -> ``redaction_unavailable``
      - redactor raises or returns a non-string -> ``redaction_unavailable``
      - a known credential shape survives redaction -> ``redaction_insufficient``
      - too little content survives -> ``state_too_sparse``
      - result exceeds ``max_bytes`` -> ``state_too_large`` (never truncated)
    """
    if redactor is None:
        return RedactionOutcome.failure("redaction_unavailable")

    try:
        redacted = redactor(serialized_state)
    except Exception:
        return RedactionOutcome.failure("redaction_unavailable")

    if not isinstance(redacted, str):
        return RedactionOutcome.failure("redaction_unavailable")

    if _has_surviving_credential_shape(redacted):
        return RedactionOutcome.failure("redaction_insufficient")

    if _alphanumeric_count(redacted) < MIN_ALPHANUMERIC_CHARS:
        return RedactionOutcome.failure("state_too_sparse")

    if len(redacted.encode("utf-8")) > max_bytes:
        return RedactionOutcome.failure("state_too_large")

    return RedactionOutcome.success(redacted)
