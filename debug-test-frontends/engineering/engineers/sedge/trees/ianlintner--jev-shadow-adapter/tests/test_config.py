from __future__ import annotations

from pathlib import Path

from jev_shadow.config import SecretKey, Settings, resolve_api_key


def test_secret_key_repr_and_str_never_reveal_value():
    key = SecretKey("super-secret-value")
    assert "super-secret-value" not in repr(key)
    assert "super-secret-value" not in str(key)
    assert repr(key) == "<typesafe-api-key>"
    assert str(key) == "<typesafe-api-key>"
    assert "super-secret-value" not in f"{key}"


def test_secret_key_reveal_returns_raw_value():
    key = SecretKey("super-secret-value")
    assert key.reveal() == "super-secret-value"


def test_resolve_api_key_explicit_argument_wins():
    key = resolve_api_key(api_key="explicit", env={"TYPESAFE_API_KEY": "env-value"})
    assert key is not None
    assert key.reveal() == "explicit"


def test_resolve_api_key_falls_back_to_env(tmp_path: Path):
    key = resolve_api_key(env={"TYPESAFE_API_KEY": "env-value"}, hermes_home=tmp_path)
    assert key is not None
    assert key.reveal() == "env-value"


def test_resolve_api_key_falls_back_to_hermes_env_file(tmp_path: Path):
    (tmp_path / ".env").write_text("TYPESAFE_API_KEY=from-file\nOTHER=1\n", encoding="utf-8")
    key = resolve_api_key(env={}, hermes_home=tmp_path)
    assert key is not None
    assert key.reveal() == "from-file"


def test_resolve_api_key_hermes_env_file_ignores_comments_and_quotes(tmp_path: Path):
    (tmp_path / ".env").write_text(
        "# comment\n\nTYPESAFE_API_KEY=\"quoted-value\"\n", encoding="utf-8"
    )
    key = resolve_api_key(env={}, hermes_home=tmp_path)
    assert key is not None
    assert key.reveal() == "quoted-value"


def test_resolve_api_key_returns_none_when_nothing_found(tmp_path: Path):
    key = resolve_api_key(env={}, hermes_home=tmp_path)
    assert key is None


def test_resolve_api_key_ignores_HERMES_HOME_profile_dir_uses_real_hermes_home(
    tmp_path: Path,
):
    """Regression: HERMES_HOME pointed at a profile dir must not hide
    ``~/.hermes/.env``. Both candidate directories are tmp paths, and the
    real Hermes home is redirected via JEV_SHADOW_HERMES_HOME so the test
    never touches the developer's actual ~/.hermes."""
    profile_dir = tmp_path / "profiles" / "coder-claude"
    profile_dir.mkdir(parents=True)
    (profile_dir / ".env").write_text("OTHER=1\n", encoding="utf-8")

    real_home = tmp_path / "real_home"
    real_home.mkdir()
    (real_home / ".env").write_text("TYPESAFE_API_KEY=from-real-home\n", encoding="utf-8")

    key = resolve_api_key(
        env={
            "HERMES_HOME": str(profile_dir),
            "JEV_SHADOW_HERMES_HOME": str(real_home),
        }
    )
    assert key is not None
    assert key.reveal() == "from-real-home"


def test_resolve_api_key_falls_back_to_HERMES_HOME_when_real_home_lacks_key(
    tmp_path: Path,
):
    real_home = tmp_path / "real_home"
    real_home.mkdir()  # no .env here

    hermes_home_dir = tmp_path / "hermes_home_env"
    hermes_home_dir.mkdir()
    (hermes_home_dir / ".env").write_text(
        "TYPESAFE_API_KEY=from-hermes-home\n", encoding="utf-8"
    )

    key = resolve_api_key(
        env={
            "HERMES_HOME": str(hermes_home_dir),
            "JEV_SHADOW_HERMES_HOME": str(real_home),
        }
    )
    assert key is not None
    assert key.reveal() == "from-hermes-home"


def test_resolve_api_key_returns_none_when_no_file_or_env_var_or_argument(
    tmp_path: Path,
):
    real_home = tmp_path / "real_home"
    real_home.mkdir()  # empty, no .env

    key = resolve_api_key(env={"JEV_SHADOW_HERMES_HOME": str(real_home)})
    assert key is None


def test_settings_kill_switch_active(tmp_path: Path):
    kill_file = tmp_path / "kill"
    settings = Settings(kill_file=kill_file)
    assert settings.kill_switch_active() is False
    kill_file.write_text("stop")
    assert settings.kill_switch_active() is True


def test_settings_from_env_resolves_key_and_kill_file(tmp_path: Path):
    kill_file = tmp_path / "kill"
    settings = Settings.from_env(
        env={"TYPESAFE_API_KEY": "abc", "JEV_SHADOW_KILL_FILE": str(kill_file)}
    )
    assert settings.api_key is not None
    assert settings.api_key.reveal() == "abc"
    assert settings.kill_file == kill_file
    assert settings.kill_switch_active() is False


def test_settings_allow_ambient_defaults_true():
    settings = Settings()
    assert settings.allow_ambient is True


def test_settings_from_env_allow_ambient_defaults_true():
    settings = Settings.from_env(env={})
    assert settings.allow_ambient is True


def test_settings_from_env_allow_ambient_env_var_disables():
    settings = Settings.from_env(env={"JEV_SHADOW_ALLOW_AMBIENT": "0"})
    assert settings.allow_ambient is False


def test_settings_from_env_allow_ambient_explicit_override_wins_over_env():
    settings = Settings.from_env(
        env={"JEV_SHADOW_ALLOW_AMBIENT": "0"}, allow_ambient=True
    )
    assert settings.allow_ambient is True
