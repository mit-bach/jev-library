"""Settings and credential resolution for the Jev shadow harness.

Credential handling is deliberately narrow: the raw API key is only ever held
inside a ``SecretKey`` wrapper whose ``__repr__``/``__str__`` never reveal it,
and the raw value is only readable through a single explicitly named method
used at the one call site that needs to build an HTTP header.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

DEFAULT_MODEL = "jev-1.13.0"
DEFAULT_ENDPOINT = "https://api.typesafe.ai/v1/systemone"
DEFAULT_TIMEOUT_SECONDS = 8.0
DEFAULT_MAX_STATE_BYTES = 64_000
_REDACTED_REPR = "<typesafe-api-key>"


class SecretKey:
    """Wraps a credential so it can never be accidentally logged or printed.

    The raw value is only obtainable via :meth:`reveal`, which callers must
    invoke by name at the single call site that needs it (building the
    Authorization header). Every other access path -- ``repr``, ``str``,
    f-strings, ``%s`` formatting -- yields a fixed placeholder.
    """

    __slots__ = ("_value",)

    def __init__(self, value: str) -> None:
        self._value = value

    def reveal(self) -> str:
        """Return the raw secret. Call only at the outbound HTTP call site."""
        return self._value

    def __repr__(self) -> str:  # pragma: no cover - trivial
        return _REDACTED_REPR

    def __str__(self) -> str:  # pragma: no cover - trivial
        return _REDACTED_REPR

    def __eq__(self, other: object) -> bool:
        if isinstance(other, SecretKey):
            return self._value == other._value
        return NotImplemented

    def __hash__(self) -> int:  # pragma: no cover - trivial
        return hash(self._value)


_TRUTHY_ENV_VALUES = {"1", "true", "yes", "on"}
_FALSY_ENV_VALUES = {"0", "false", "no", "off"}


def _parse_bool_env(raw: str, *, default: bool) -> bool:
    """Parse a boolean env var value. Unrecognized text keeps ``default``."""
    normalized = raw.strip().lower()
    if normalized in _TRUTHY_ENV_VALUES:
        return True
    if normalized in _FALSY_ENV_VALUES:
        return False
    return default


def _read_hermes_env_file(path: Path) -> dict[str, str]:
    """Parse a ``KEY=VALUE`` env file. Missing/unreadable file -> empty dict."""
    try:
        raw = path.read_text(encoding="utf-8")
    except OSError:
        return {}
    values: dict[str, str] = {}
    for line in raw.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            values[key] = value
    return values


#: Overrides the *real* Hermes home used for step 3 below. Distinct from
#: ``HERMES_HOME`` itself, which a real Hermes profile session points at a
#: profile subdirectory rather than the Hermes home -- see ``resolve_api_key``.
_REAL_HERMES_HOME_ENV_VAR = "JEV_SHADOW_HERMES_HOME"


def _resolve_real_hermes_home(
    environ: dict[str, str], hermes_home: str | Path | None
) -> Path:
    """The actual Hermes home directory, independent of ``HERMES_HOME``."""
    if hermes_home is not None:
        return Path(hermes_home).expanduser()
    override = environ.get(_REAL_HERMES_HOME_ENV_VAR)
    if override:
        return Path(override).expanduser()
    return Path.home() / ".hermes"


def resolve_api_key(
    *,
    api_key: str | None = None,
    env: dict[str, str] | None = None,
    hermes_home: str | Path | None = None,
) -> SecretKey | None:
    """Resolve the TypeSafe API key.

    Order, stopping at the first hit:

      1. explicit ``api_key`` argument
      2. ``TYPESAFE_API_KEY`` in ``env`` (defaults to ``os.environ``)
      3. ``~/.hermes/.env`` -- the real Hermes home (overridable via the
         ``hermes_home`` argument, mainly for tests, or the
         ``JEV_SHADOW_HERMES_HOME`` env var). ``HERMES_HOME`` itself is
         *not* used here: in a real Hermes profile session it points at a
         profile directory (e.g. ``~/.hermes/profiles/<name>``), not the
         Hermes home, and trusting it would hide the documented file.
      4. ``$HERMES_HOME/.env`` as a fallback, only when it names a
         different file than the one already tried in step 3.
    """
    if api_key:
        return SecretKey(api_key)

    environ = env if env is not None else os.environ
    from_env = environ.get("TYPESAFE_API_KEY")
    if from_env:
        return SecretKey(from_env)

    real_home = _resolve_real_hermes_home(environ, hermes_home)
    real_env_path = real_home / ".env"
    real_values = _read_hermes_env_file(real_env_path)
    from_real_home = real_values.get("TYPESAFE_API_KEY")
    if from_real_home:
        return SecretKey(from_real_home)

    hermes_home_env_var = environ.get("HERMES_HOME")
    if hermes_home_env_var:
        fallback_env_path = Path(hermes_home_env_var).expanduser() / ".env"
        if fallback_env_path.expanduser().resolve() != real_env_path.expanduser().resolve():
            fallback_values = _read_hermes_env_file(fallback_env_path)
            from_fallback = fallback_values.get("TYPESAFE_API_KEY")
            if from_fallback:
                return SecretKey(from_fallback)

    return None


@dataclass(frozen=True)
class Settings:
    """Runtime configuration for the shadow harness. Holds no secrets."""

    model: str = DEFAULT_MODEL
    endpoint: str = DEFAULT_ENDPOINT
    timeout_seconds: float = DEFAULT_TIMEOUT_SECONDS
    enabled: bool = True
    max_state_bytes: int = DEFAULT_MAX_STATE_BYTES
    kill_file: Path | None = None
    hermes_agent_root: Path | None = None
    #: Whether the harness may fall back to an already-importable ``agent.redact``
    #: (i.e. running in-process inside Hermes) when no explicit redactor or
    #: ``hermes_agent_root`` is given. True by default: in-process Hermes is
    #: the intended production home for this harness, and that is exactly
    #: where an ambient ``agent.redact`` is expected to be importable already.
    #: Resolution still fails closed via ``find_spec`` if the module is absent
    #: or broken -- this only controls whether ambient lookup is *attempted*.
    #: Override with ``JEV_SHADOW_ALLOW_AMBIENT=0`` to disable it.
    allow_ambient: bool = True
    api_key: SecretKey | None = field(default=None, repr=False)

    def kill_switch_active(self) -> bool:
        return self.kill_file is not None and Path(self.kill_file).exists()

    @classmethod
    def from_env(
        cls,
        *,
        api_key: str | None = None,
        env: dict[str, str] | None = None,
        **overrides: object,
    ) -> Settings:
        """Build settings, resolving the API key via :func:`resolve_api_key`."""
        environ = env if env is not None else os.environ
        resolved_key = resolve_api_key(api_key=api_key, env=environ)
        kill_file = overrides.pop("kill_file", None)
        if kill_file is None:
            raw_kill_file = environ.get("JEV_SHADOW_KILL_FILE")
            kill_file = Path(raw_kill_file) if raw_kill_file else None
        hermes_agent_root = overrides.pop("hermes_agent_root", None)
        if hermes_agent_root is None:
            raw_root = environ.get("HERMES_AGENT_ROOT")
            hermes_agent_root = Path(raw_root) if raw_root else None
        allow_ambient = overrides.pop("allow_ambient", None)
        if allow_ambient is None:
            raw_allow_ambient = environ.get("JEV_SHADOW_ALLOW_AMBIENT")
            allow_ambient = (
                _parse_bool_env(raw_allow_ambient, default=True)
                if raw_allow_ambient is not None
                else True
            )
        return cls(
            api_key=resolved_key,
            kill_file=kill_file,
            hermes_agent_root=hermes_agent_root,
            allow_ambient=allow_ambient,
            **overrides,  # type: ignore[arg-type]
        )
