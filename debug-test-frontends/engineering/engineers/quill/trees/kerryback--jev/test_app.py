"""Tests for the Jev playground.

The Jev tests are live and not mocked. A mocked test of a demo whose entire
claim is "the model returns typed answers" would assert only that the mock was
written correctly. They need OPENROUTER_API_KEY; without one they skip rather
than fail.

Run:  .venv/bin/python -m pytest test_app.py -v
"""

from __future__ import annotations

import asyncio
import json
import re

import pytest
from fastapi.testclient import TestClient

import config
import jev
import limits
from app import app

needs_key = pytest.mark.skipif(not config.API_KEY, reason="no OPENROUTER_API_KEY")
client = TestClient(app)


# --- the page (no network) ---------------------------------------------------


def test_page_renders_with_presets_substituted():
    body = client.get("/").text
    assert not re.search(r"__[A-Z]+__", body), "a placeholder was left unsubstituted"
    assert "Jev playground" in body
    for name in config.PRESETS:
        assert name in body


def test_every_preset_is_a_well_formed_request():
    """A preset that errors on Run would waste class time."""
    for name, preset in config.PRESETS.items():
        assert "state" in preset and "questions" in preset, name
        for qname, q in preset["questions"].items():
            assert q["type"] in {"noul", "choice", "score"}, (name, qname)
            if q["type"] in {"choice", "score"}:
                assert q.get("criteria"), f"{name}/{qname} needs criteria"
        json.dumps(preset)      # must survive the trip to the browser


def test_templates_match_the_three_question_types():
    assert set(config.TEMPLATES) == {"noul", "choice", "score"}
    for kind, tpl in config.TEMPLATES.items():
        assert tpl["type"] == kind


def test_empty_questions_is_rejected_before_calling_jev():
    r = client.post("/api/run", json={"state": {"x": "y"}, "questions": {}})
    assert r.status_code == 400
    assert "at least one question" in r.json()["detail"]


# --- Jev (live) --------------------------------------------------------------


@needs_key
def test_run_returns_all_three_answer_types_typed():
    result = asyncio.run(
        jev.run(
            {"ticket": "I was charged twice. Please fix this ASAP."},
            config.PRESETS["Support ticket"]["questions"],
        )
    )
    answers = result["answers"]
    assert set(answers) == {"billing", "tone", "urgency"}

    assert isinstance(answers["billing"]["noul"], float)
    assert 0.0 <= answers["billing"]["noul"] <= 1.0
    assert answers["billing"]["noul"] > 0.5, "a double charge is a billing ticket"

    assert answers["tone"]["choice"] in {"calm", "frustrated", "angry"}
    assert set(answers["tone"]["probabilities"]) == {"calm", "frustrated", "angry"}

    assert 0.0 <= answers["urgency"]["score"] <= 2.0
    # int keys here; they become strings once serialized to the browser, which is
    # why the page indexes the legend with a string.
    assert answers["urgency"]["legend"] == {0: "low", 1: "medium", 2: "high"}

    assert result["model"].startswith("typesafe/jev")
    assert result["usage"]["input_tokens"] > 0


@needs_key
@pytest.mark.parametrize("preset", list(config.PRESETS))
def test_each_preset_actually_runs(preset):
    p = config.PRESETS[preset]
    result = asyncio.run(jev.run(p["state"], p["questions"]))
    assert set(result["answers"]) == set(p["questions"])


@needs_key
def test_endpoint_surfaces_sdk_validation_errors():
    r = client.post(
        "/api/run",
        json={"state": {"x": "y"}, "questions": {"tone": {"type": "choice", "instructions": "Tone?"}}},
    )
    assert r.status_code == 400
    assert "criteria" in r.json()["detail"]


@needs_key
def test_endpoint_round_trip():
    p = config.PRESETS["Earnings call"]
    r = client.post("/api/run", json={"state": p["state"], "questions": p["questions"]})
    assert r.status_code == 200
    body = r.json()
    # steering margin to "the low end of our prior range" is a guidance cut, and
    # the criteria on that Noul say so explicitly
    assert body["answers"]["cuts_guidance"]["noul"] > 0.5
    assert body["answers"]["confidence_tone"]["score"] <= 1.5, "this is not a confident quote"
    assert body["elapsed_ms"] > 0


@needs_key
def test_legend_and_probability_keys_are_strings_over_json():
    """The browser indexes legend/probabilities by string key; lock that in."""
    p = config.PRESETS["Support ticket"]
    body = client.post("/api/run", json={"state": p["state"], "questions": p["questions"]}).json()
    score = body["answers"]["urgency"]
    assert set(score["legend"]) == {"0", "1", "2"}
    assert set(score["probabilities"]) == {"0", "1", "2"}


def test_new_preset_is_minimal_and_separated():
    """The blank slate is one field and one question -- the smallest thing that runs."""
    new = config.PRESETS[config.NEW_PRESET]
    assert len(new["state"]) == 1
    assert len(new["questions"]) == 1
    assert config.NEW_PRESET != config.DEFAULT_PRESET


def test_dropdown_groups_demos_apart_from_the_blank_slate():
    body = client.get("/").text
    assert 'label = "Demos"' in body and 'label = "Start from scratch"' in body


def test_there_are_three_demos_plus_the_blank_slate():
    demos = [k for k in config.PRESETS if k != config.NEW_PRESET]
    assert len(demos) == 3, demos
    assert demos[0] == config.DEFAULT_PRESET, "the default should load first"


def test_company_screen_asks_many_questions_in_one_call():
    """The fan-out is the demo; if it shrinks, the point is lost."""
    assert len(config.PRESETS["Company screen"]["questions"]) >= 8


def test_blank_slate_is_marked_blank_and_demos_are_not():
    """`blank` drives placeholder-vs-content in the page; demos must load as content."""
    assert config.PRESETS[config.NEW_PRESET].get("blank") is True
    for name, p in config.PRESETS.items():
        if name != config.NEW_PRESET:
            assert not p.get("blank"), f"{name} would load as empty boxes"


def test_selecting_a_demo_clears_the_previous_answers():
    """Leaving stale answers up reads as though selecting a demo ran it."""
    body = client.get("/").text
    loader = body[body.index("function loadPreset"):body.index("$(\"preset\").addEventListener")]
    assert "out.innerHTML = EMPTY_MSG" in loader


def test_run_is_never_wired_to_preset_selection():
    """Nothing should fire a request except the Run button and the keyboard shortcut."""
    body = client.get("/").text
    loader = body[body.index("function loadPreset"):body.index("$(\"preset\").addEventListener")]
    assert "run()" not in loader


def test_answer_type_badges_carry_an_explanation():
    """The badge tooltip is where a student finds out what a noul is."""
    body = client.get("/").text
    assert "Short for Bernoulli" in body
    for kind in ("noul:", "choice:", "score:"):
        assert kind in body


# --- rate limiting (no network) ----------------------------------------------


def test_per_ip_cap_allows_then_refuses():
    rl = limits.RateLimiter(per_ip_hour=3, global_day=1000)
    assert [rl.check_and_count("1.2.3.4") for _ in range(3)] == [None, None, None]
    refused = rl.check_and_count("1.2.3.4")
    assert refused and "limit" in refused
    # a different caller is unaffected
    assert rl.check_and_count("5.6.7.8") is None


def test_per_ip_window_slides():
    rl = limits.RateLimiter(per_ip_hour=2, global_day=1000)
    t = 1_000_000.0
    assert rl.check_and_count("ip", now=t) is None
    assert rl.check_and_count("ip", now=t + 1) is None
    assert rl.check_and_count("ip", now=t + 2) is not None
    # once the first two age past the hour, the caller is allowed again
    assert rl.check_and_count("ip", now=t + limits.HOUR + 3) is None


def test_global_cap_stops_everyone():
    rl = limits.RateLimiter(per_ip_hour=100, global_day=2)
    assert rl.check_and_count("a") is None
    assert rl.check_and_count("b") is None
    refused = rl.check_and_count("c")
    assert refused and "daily cap" in refused


def test_refusal_does_not_consume_quota():
    """A blocked call must not count, or one loop would lock a user out forever."""
    rl = limits.RateLimiter(per_ip_hour=1, global_day=1000)
    rl.check_and_count("ip", now=1000.0)
    for _ in range(5):
        assert rl.check_and_count("ip", now=1001.0) is not None
    assert rl.snapshot(now=1001.0)["runs_today"] == 1


def test_idle_ips_are_evicted():
    rl = limits.RateLimiter(per_ip_hour=5, global_day=10_000)
    t = 1_000_000.0
    for i in range(limits.MAX_TRACKED_IPS + 10):
        rl.check_and_count(f"10.0.{i // 256}.{i % 256}", now=t)
    # everything is inside the window, so nothing is evicted yet
    assert rl.snapshot(now=t)["tracked_ips"] > limits.MAX_TRACKED_IPS
    rl.check_and_count("fresh", now=t + limits.HOUR + 1)
    assert rl.snapshot(now=t + limits.HOUR + 1)["tracked_ips"] == 1


def test_client_ip_prefers_the_leftmost_forwarded_entry():
    class Req:
        def __init__(self, headers, host="127.0.0.1"):
            self.headers = headers
            self.client = type("C", (), {"host": host})()

    assert limits.client_ip(Req({"x-forwarded-for": "203.0.113.9, 70.1.1.1"})) == "203.0.113.9"
    assert limits.client_ip(Req({}, host="198.51.100.4")) == "198.51.100.4"


def test_endpoint_returns_429_when_capped(monkeypatch):
    monkeypatch.setattr(limits, "limiter", limits.RateLimiter(per_ip_hour=0, global_day=1000))
    r = client.post(
        "/api/run",
        json={"state": {"x": "y"}, "questions": {"q": {"type": "noul", "instructions": "Yes?"}}},
    )
    assert r.status_code == 429
    assert "not accepting requests" in r.json()["detail"]


def test_a_cap_of_zero_switches_the_demo_off_cleanly():
    """0 is a plausible kill switch; it must 429, not blow up on an empty deque."""
    rl = limits.RateLimiter(per_ip_hour=0, global_day=1000)
    assert rl.check_and_count("ip") == "This demo is not accepting requests right now."


def test_empty_questions_is_rejected_without_spending_quota(monkeypatch):
    """Validation comes before the limiter, so a typo does not cost a run."""
    rl = limits.RateLimiter(per_ip_hour=5, global_day=1000)
    monkeypatch.setattr(limits, "limiter", rl)
    assert client.post("/api/run", json={"state": {}, "questions": {}}).status_code == 400
    assert rl.snapshot()["runs_today"] == 0


def test_healthz_is_free_and_reports_caps():
    body = client.get("/healthz").json()
    assert body["ok"] is True
    assert "runs_today" in body and "global_day" in body
