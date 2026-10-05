"""Low-cardinality, observational Prometheus exposition for shadow events.

Opt-in: pass a ShadowMetrics instance to JevShadowHarness(metrics=...). The
registry contains only bounded enums and numeric aggregates, never event IDs,
model names, prompts, reason strings, or provider payloads. Metrics failures
must not affect the caller's decision path.
"""

from __future__ import annotations

import math
import threading
from collections import Counter
from dataclasses import dataclass, field
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from .events import ShadowEvent

TIERS = ("cheap", "standard", "strong", "unknown")
OUTCOMES = ("success", "skipped", "error")
LATENCY_BUCKETS = (50, 100, 200, 500, 1000, 5000)
CONFIDENCE_BUCKETS = (0.25, 0.5, 0.75, 0.9, 1.0)
COST_BUCKETS = (0.000001, 0.00001, 0.0001, 0.001, 0.01)


def _tier(value: str | None) -> str:
    return value if value in TIERS[:-1] else "unknown"


def _number(value: object) -> float | None:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    number = float(value)
    return number if math.isfinite(number) and number >= 0 else None


@dataclass
class _Histogram:
    buckets: Counter[float] = field(default_factory=Counter)
    count: int = 0
    total: float = 0.0


class ShadowMetrics:
    """Thread-safe in-process accumulator; export with :meth:`render`."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._decisions: Counter[tuple[str, str, str, str]] = Counter()
        self._hist: dict[str, _Histogram] = {
            name: _Histogram()
            for name in ("jev_shadow_latency_ms", "jev_shadow_confidence", "jev_shadow_cost_usd")
        }
        self._cost_total = 0.0

    def _record(self, name: str, value: float, buckets: tuple[float, ...]) -> None:
        item = self._hist[name]
        for bound in buckets:
            if value <= bound:
                item.buckets[bound] += 1
        item.count += 1
        item.total += value

    def observe(self, event: ShadowEvent) -> None:
        outcome = event.outcome if event.outcome in OUTCOMES else "error"
        suggested = _tier(event.jev_suggested_tier) if outcome == "success" else "unknown"
        baseline = _tier(event.current_heuristic_tier)
        comparable = outcome == "success" and suggested != "unknown"
        match = "unknown"
        if comparable:
            match = "match" if suggested == baseline else "different"
        latency = _number(event.latency_ms)
        confidence = _number(event.confidence)
        cost = _number(event.cost_usd)
        with self._lock:
            self._decisions[(outcome, suggested, baseline, match)] += 1
            if latency is not None:
                self._record("jev_shadow_latency_ms", latency, LATENCY_BUCKETS)
            if outcome == "success":
                if confidence is not None and confidence <= 1:
                    self._record("jev_shadow_confidence", confidence, CONFIDENCE_BUCKETS)
                if cost is not None:
                    self._record("jev_shadow_cost_usd", cost, COST_BUCKETS)
                    self._cost_total += cost

    def render(self) -> str:
        """Prometheus text format, without mutable/user-controlled labels."""
        with self._lock:
            decisions = self._decisions.copy()
            hist = {
                key: _Histogram(item.buckets.copy(), item.count, item.total)
                for key, item in self._hist.items()
            }
            cost_total = self._cost_total
        lines = [
            "# HELP jev_shadow_decisions_total Shadow evaluations by outcome and tier comparison.",
            "# TYPE jev_shadow_decisions_total counter",
        ]
        for (outcome, suggested, baseline, match), count in sorted(decisions.items()):
            labels = (
                f'outcome="{outcome}",jev_tier="{suggested}",'
                f'baseline_tier="{baseline}",comparison="{match}"'
            )
            lines.append(f"jev_shadow_decisions_total{{{labels}}} {count}")
        lines += [
            "# HELP jev_shadow_cost_usd_total Cumulative provider-reported shadow cost in USD.",
            "# TYPE jev_shadow_cost_usd_total counter",
            f"jev_shadow_cost_usd_total {cost_total:.12g}",
        ]
        for name, buckets in (
            ("jev_shadow_latency_ms", LATENCY_BUCKETS),
            ("jev_shadow_confidence", CONFIDENCE_BUCKETS),
            ("jev_shadow_cost_usd", COST_BUCKETS),
        ):
            lines += [f"# HELP {name} Distribution of observed {name}.", f"# TYPE {name} histogram"]
            item = hist[name]
            for bound in buckets:
                lines.append(f'{name}_bucket{{le="{bound}"}} {item.buckets[bound]}')
            lines += [
                f'{name}_bucket{{le="+Inf"}} {item.count}',
                f"{name}_sum {item.total:.12g}",
                f"{name}_count {item.count}",
            ]
        return "\n".join(lines) + "\n"

    def serve(self, host: str = "127.0.0.1", port: int = 0) -> ThreadingHTTPServer:
        """Return a loopback-bound server; caller owns serve_forever/shutdown."""
        registry = self

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self) -> None:
                if self.path != "/metrics":
                    self.send_error(404)
                    return
                body = registry.render().encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "text/plain; version=0.0.4; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def log_message(self, format: str, *args: object) -> None:
                pass

        if host not in ("127.0.0.1", "::1", "localhost"):
            raise ValueError("metrics endpoint must bind to loopback")
        return ThreadingHTTPServer((host, port), Handler)
