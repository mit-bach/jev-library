from __future__ import annotations

import json
import threading
import urllib.error
import urllib.request
from dataclasses import replace
from pathlib import Path

import pytest
from conftest import good_redactor
from test_harness import _settings, _success_result, _turn

from jev_shadow.events import ShadowEvent
from jev_shadow.metrics import ShadowMetrics


def _event(**overrides) -> ShadowEvent:
    base = ShadowEvent(
        timestamp="2026-01-01T00:00:00Z", session_id="private-session",
        turn_id="private-turn", model_current="private-model",
        jev_suggested_tier="cheap", current_heuristic_tier="standard",
        match=False, jev_confidence=0.8, jev_difficulty_score=0.1,
        jev_difficulty_normalized=0.1, jev_noul=0.2,
        jev_choice="cheap", confidence=0.8, cost_usd=0.0000042,
        latency_ms=100, outcome="success", reason=None, input_tokens=100,
    )
    return replace(base, **overrides)


def test_metrics_counts_histograms_cost_and_no_private_labels():
    metrics = ShadowMetrics()
    metrics.observe(_event())
    metrics.observe(_event(jev_suggested_tier="standard", match=True, latency_ms=700))
    metrics.observe(_event(outcome="error", reason="a user secret", latency_ms=12, cost_usd=None))
    text = metrics.render()
    assert (
        'jev_shadow_decisions_total{outcome="success",jev_tier="cheap",'
        'baseline_tier="standard",comparison="different"} 1'
    ) in text
    assert (
        'jev_shadow_decisions_total{outcome="success",jev_tier="standard",'
        'baseline_tier="standard",comparison="match"} 1'
    ) in text
    assert (
        'jev_shadow_decisions_total{outcome="error",jev_tier="unknown",'
        'baseline_tier="standard",comparison="unknown"} 1'
    ) in text
    assert 'jev_shadow_latency_ms_bucket{le="100"} 2' in text
    assert 'jev_shadow_latency_ms_bucket{le="+Inf"} 3' in text
    assert 'jev_shadow_confidence_count 2' in text
    assert 'jev_shadow_cost_usd_count 2' in text
    assert 'jev_shadow_cost_usd_total 8.4e-06' in text
    for private in ("private-session", "private-turn", "private-model", "a user secret"):
        assert private not in text


def test_unknown_values_cannot_inject_labels_or_invalid_numbers():
    metrics = ShadowMetrics()
    metrics.observe(
        _event(
            jev_suggested_tier='cheap",user="secret',
            current_heuristic_tier="new-model",
            cost_usd=float("nan"),
            latency_ms=-1,
            confidence=2,
        )
    )
    text = metrics.render()
    assert "secret" not in text
    assert 'comparison="unknown"' in text
    assert 'jev_shadow_latency_ms_count 0' in text
    assert 'jev_shadow_confidence_count 0' in text
    assert 'jev_shadow_cost_usd_count 0' in text
    assert 'jev_shadow_cost_usd_total 0' in text


def test_loopback_metrics_endpoint_and_404():
    metrics = ShadowMetrics()
    metrics.observe(_event())
    server = metrics.serve()
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        url = f"http://127.0.0.1:{server.server_port}/metrics"
        with urllib.request.urlopen(url, timeout=3) as response:
            assert response.status == 200
            assert response.headers["Content-Type"].startswith("text/plain")
            assert b"jev_shadow_decisions_total" in response.read()
        with pytest.raises(urllib.error.HTTPError) as exc:
            urllib.request.urlopen(url.replace("/metrics", "/nope"), timeout=3)
        assert exc.value.code == 404
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=3)
    with pytest.raises(ValueError):
        metrics.serve(host="0.0.0.0")


def test_dashboard_queries_match_exported_metrics():
    dashboard_path = Path(__file__).resolve().parents[1] / "grafana/jev-shadow-dashboard.json"
    dashboard = json.loads(dashboard_path.read_text())
    assert dashboard["uid"] == "jev-shadow-spike"
    assert len(dashboard["panels"]) >= 4
    queries = " ".join(t["expr"] for p in dashboard["panels"] for t in p["targets"])
    for metric in (
        "jev_shadow_decisions_total",
        "jev_shadow_latency_ms_bucket",
        "jev_shadow_cost_usd_total",
        "jev_shadow_confidence_bucket",
    ):
        assert metric in queries


def test_harness_metrics_are_observational():
    from jev_shadow.config import Settings
    from jev_shadow.decision import Turn
    from jev_shadow.harness import JevShadowHarness

    class BrokenMetrics:
        def observe(self, event):
            raise RuntimeError("metrics failed")

    turn = Turn(user_message="hello", current_model="hermes-4", available_models=("hermes-4",))
    harness = JevShadowHarness(Settings(enabled=False), metrics=BrokenMetrics())
    event = harness.decide(turn, session_id="s", turn_id="t")
    assert event.outcome == "skipped"
    metrics = ShadowMetrics()
    harness = JevShadowHarness(Settings(enabled=False), metrics=metrics)
    assert harness.decide(turn, session_id="s", turn_id="t").outcome == "skipped"
    assert 'outcome="skipped"' in metrics.render()


def test_successful_jev_call_records_metrics_without_changing_baseline():
    from jev_shadow.harness import JevShadowHarness

    metrics = ShadowMetrics()
    harness = JevShadowHarness(
        _settings(), metrics=metrics, redactor=good_redactor,
        call_jev=lambda **kwargs: _success_result(),
    )
    event = harness.decide(_turn(), session_id="private", turn_id="private")
    assert event.outcome == "success"
    assert event.current_heuristic_tier == "standard"
    assert event.jev_suggested_tier == "cheap"
    text = metrics.render()
    assert (
        'jev_shadow_decisions_total{outcome="success",jev_tier="cheap",'
        'baseline_tier="standard",comparison="different"} 1'
    ) in text
    assert 'jev_shadow_confidence_count 1' in text
    assert 'jev_shadow_cost_usd_count 1' in text
