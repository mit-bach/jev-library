from __future__ import annotations

import os
import sys
from pathlib import Path

import pytest
from conftest import good_redactor, leaky_redactor, raising_redactor

from jev_shadow.redaction import redact_outbound_state, resolve_redactor


def test_resolve_redactor_prefers_injected_callable():
    resolved = resolve_redactor(redactor=good_redactor, hermes_agent_root=None)
    assert resolved is good_redactor


def test_resolve_redactor_returns_none_when_nothing_available():
    sys.modules.pop("agent", None)
    sys.modules.pop("agent.redact", None)
    resolved = resolve_redactor(redactor=None, hermes_agent_root=None)
    assert resolved is None


def test_resolve_redactor_imports_from_hermes_agent_root(tmp_path: Path):
    agent_dir = tmp_path / "agent"
    agent_dir.mkdir()
    (agent_dir / "__init__.py").write_text("", encoding="utf-8")
    (agent_dir / "redact.py").write_text(
        "def redact_for_egress(text):\n    return text.replace('secret', '[REDACTED]')\n",
        encoding="utf-8",
    )
    sys.modules.pop("agent", None)
    sys.modules.pop("agent.redact", None)
    try:
        resolved = resolve_redactor(redactor=None, hermes_agent_root=tmp_path)
        assert resolved is not None
        assert resolved("has a secret value") == "has a [REDACTED] value"
    finally:
        sys.modules.pop("agent", None)
        sys.modules.pop("agent.redact", None)
        if str(tmp_path) in sys.path:
            sys.path.remove(str(tmp_path))


#: Optional real-Hermes-checkout probe. Never hardcode a machine-specific
#: path: resolve from the environment, else a home-relative default. The test
#: skips when the checkout is absent, so this stays portable across machines.
_REAL_HERMES_AGENT_ROOT = Path(
    os.environ.get(
        "JEV_SHADOW_TEST_HERMES_ROOT",
        str(Path.home() / ".hermes" / "hermes-agent"),
    )
)


@pytest.mark.skipif(
    not (_REAL_HERMES_AGENT_ROOT / "agent" / "redact.py").is_file(),
    reason="real Hermes checkout not present on this machine",
)
def test_resolve_redactor_scrubs_via_real_hermes_agent_root():
    """The bridge works against the actual Hermes redactor, not just a fake.

    Never sends the credential anywhere -- only asserts on the returned text.
    """
    sys.modules.pop("agent", None)
    sys.modules.pop("agent.redact", None)
    try:
        resolved = resolve_redactor(redactor=None, hermes_agent_root=_REAL_HERMES_AGENT_ROOT)
        assert resolved is not None
        scrubbed = resolved(
            "here is some ordinary text and then "
            "Authorization: Bearer sk-abcdefghijklmnopqrstuvwxyz and more text"
        )
        assert "sk-abcdefghijklmnopqrstuvwxyz" not in scrubbed
    finally:
        sys.modules.pop("agent", None)
        sys.modules.pop("agent.redact", None)
        if str(_REAL_HERMES_AGENT_ROOT) in sys.path:
            sys.path.remove(str(_REAL_HERMES_AGENT_ROOT))


def test_redact_outbound_state_fails_closed_when_no_redactor():
    outcome = redact_outbound_state("some state text", redactor=None, max_bytes=10_000)
    assert outcome.ok is False
    assert outcome.reason == "redaction_unavailable"
    assert outcome.text is None


def test_redact_outbound_state_fails_closed_when_redactor_raises():
    outcome = redact_outbound_state(
        "some state text", redactor=raising_redactor, max_bytes=10_000
    )
    assert outcome.ok is False
    assert outcome.reason == "redaction_unavailable"


def test_redact_outbound_state_fails_closed_when_redactor_returns_non_string():
    outcome = redact_outbound_state(
        "some state text", redactor=lambda text: None, max_bytes=10_000
    )
    assert outcome.ok is False
    assert outcome.reason == "redaction_unavailable"


@pytest.mark.parametrize(
    "credential_text",
    [
        "Authorization: Bearer sk-abcdefghijklmnopqrstuvwxyz",
        "key is apikey_ABCDEFGHIJKL123456",
        "token ghp_ABCDEFGHIJKLMNOPQR1234567890",
        "aws AKIA1234567890ABCDEF here",
        "-----BEGIN RSA PRIVATE KEY-----\nMIIBogIBAAJ\n-----END RSA PRIVATE KEY-----",
        "password=SuperSecretValue123",
        "secret=SuperSecretValue123",
    ],
)
def test_redact_outbound_state_catches_surviving_credential_shapes(credential_text):
    padded = f"here is some ordinary text and then {credential_text} and more text"
    outcome = redact_outbound_state(padded, redactor=leaky_redactor, max_bytes=10_000)
    assert outcome.ok is False
    assert outcome.reason == "redaction_insufficient"


def test_redact_outbound_state_rejects_too_sparse_output():
    outcome = redact_outbound_state(
        "xyz", redactor=lambda text: "... ...", max_bytes=10_000
    )
    assert outcome.ok is False
    assert outcome.reason == "state_too_sparse"


def test_redact_outbound_state_rejects_oversize_output():
    big_text = "a" * 1000
    outcome = redact_outbound_state(big_text, redactor=lambda text: text, max_bytes=100)
    assert outcome.ok is False
    assert outcome.reason == "state_too_large"


def test_redact_outbound_state_success_scrubs_credentials():
    state = 'plain text with Bearer sk-abcdefghijklmnopqrstuvwxyz1234 inside it, plus normal words'
    outcome = redact_outbound_state(state, redactor=good_redactor, max_bytes=10_000)
    assert outcome.ok is True
    assert outcome.text is not None
    assert "sk-abcdefghijklmnopqrstuvwxyz1234" not in outcome.text
    assert "Bearer" not in outcome.text


# The real Hermes redactor at HERMES_AGENT_ROOT truncates `sk-...` values and
# masks `Bearer ...`, but deliberately leaves a bare `password=...`/`secret=...`
# assignment in conversational prose untouched (it only catches secret-named
# *variable* assignments, not free text) -- so the belt-and-braces
# credential-assignment check below is genuinely load-bearing for this shape,
# verified against a real redactor run, not a hypothetical.
_REAL_REDACTOR_SURVIVING_CREDENTIAL_TEXT = (
    '{"user_message": "my key is sk-pro...AAAA and password=hunter2secret", '
    '"note": "Authorization: Bearer ***"}'
)


def test_redact_outbound_state_blocks_credential_assignment_that_survives_real_redactor():
    outcome = redact_outbound_state(
        _REAL_REDACTOR_SURVIVING_CREDENTIAL_TEXT, redactor=leaky_redactor, max_bytes=10_000
    )
    assert outcome.ok is False
    assert outcome.reason == "redaction_insufficient"


@pytest.mark.parametrize(
    "credential_text",
    [
        "password=hunter2secret",
        "secret=abc123xyz",
        "api_key=sk-proj-abcdefghijklmnop",
    ],
)
def test_redact_outbound_state_blocks_real_credential_assignments(credential_text):
    padded = f"here is some ordinary text and then {credential_text} and more text"
    outcome = redact_outbound_state(padded, redactor=leaky_redactor, max_bytes=10_000)
    assert outcome.ok is False
    assert outcome.reason == "redaction_insufficient"


@pytest.mark.parametrize(
    "benign_text",
    [
        "token_limit=100",
        "secret_name=my-app",
        "api_key_id=42",
        "max_tokens=4096",
    ],
)
def test_redact_outbound_state_passes_benign_key_value_pairs(benign_text):
    padded = f"here is some ordinary state with {benign_text} and more normal words in it"
    outcome = redact_outbound_state(padded, redactor=leaky_redactor, max_bytes=10_000)
    assert outcome.ok is True
    assert outcome.text is not None
