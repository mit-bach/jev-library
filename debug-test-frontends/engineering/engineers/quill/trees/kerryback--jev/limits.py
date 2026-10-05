"""Rate limiting, so a public URL cannot run up an OpenRouter bill.

Every Run spends money, and the page is open to anyone with the link. Two caps
sit in front of it: a per-IP hourly cap, which stops one client looping, and a
global daily cap, which bounds the worst case no matter how many clients turn
up. Both are env vars, so they can be raised from the Koyeb console without a
redeploy.

The counters are in memory. That is the right trade here -- a class-sized tool
does not need a Redis to hold two integers -- but it means the caps are per
instance and reset when the service restarts or scales out. With one instance,
which is how this is deployed, that is exactly the intended behaviour.
"""

from __future__ import annotations

import os
import threading
import time
from collections import defaultdict, deque

PER_IP_HOUR = int(os.environ.get("JEV_RATE_PER_IP_HOUR", "60"))
GLOBAL_DAY = int(os.environ.get("JEV_RATE_GLOBAL_DAY", "2000"))

HOUR = 3600
DAY = 86400
# Stop the per-IP table growing without bound behind a NAT or a scanner.
MAX_TRACKED_IPS = 5000


class RateLimiter:
    def __init__(self, per_ip_hour: int = PER_IP_HOUR, global_day: int = GLOBAL_DAY):
        self.per_ip_hour = per_ip_hour
        self.global_day = global_day
        self._ip: dict[str, deque[float]] = defaultdict(deque)
        self._all: deque[float] = deque()
        self._lock = threading.Lock()

    @staticmethod
    def _prune(stamps: deque[float], window: float, now: float) -> None:
        cutoff = now - window
        while stamps and stamps[0] < cutoff:
            stamps.popleft()

    def check_and_count(self, ip: str, now: float | None = None) -> str | None:
        """Record a call. Returns None to allow, or a message explaining the refusal."""
        now = time.time() if now is None else now
        with self._lock:
            self._prune(self._all, DAY, now)
            if len(self._all) >= self.global_day:
                return (
                    f"This demo has hit its daily cap of {self.global_day} runs. "
                    "It runs on a personal API key, so the ceiling is there to keep "
                    "the bill finite. Try again tomorrow."
                )

            stamps = self._ip[ip]
            self._prune(stamps, HOUR, now)
            if len(stamps) >= self.per_ip_hour:
                if not stamps:
                    # per_ip_hour is 0 -- the demo is switched off rather than
                    # rate limited, and there is no earlier call to wait on.
                    return "This demo is not accepting requests right now."
                wait = int((stamps[0] + HOUR - now) / 60) + 1
                return (
                    f"You have used this demo {self.per_ip_hour} times in the last hour, "
                    f"which is the limit. Try again in about {wait} minute"
                    f"{'s' if wait != 1 else ''}."
                )

            stamps.append(now)
            self._all.append(now)

            if len(self._ip) > MAX_TRACKED_IPS:
                self._evict_idle(now)
        return None

    def _evict_idle(self, now: float) -> None:
        """Drop IPs with nothing inside the hour window. Caller holds the lock."""
        for key in [k for k, v in self._ip.items() if not v or v[-1] < now - HOUR]:
            del self._ip[key]

    def snapshot(self, now: float | None = None) -> dict:
        now = time.time() if now is None else now
        with self._lock:
            self._prune(self._all, DAY, now)
            return {
                "runs_today": len(self._all),
                "global_day": self.global_day,
                "per_ip_hour": self.per_ip_hour,
                "tracked_ips": len(self._ip),
            }


def client_ip(request) -> str:
    """The caller's address as seen behind Koyeb's edge.

    X-Forwarded-For is a client-controlled header, so it is only trustworthy
    because the edge rewrites it. The left-most entry is the original client;
    anything further right was added by proxies along the way.
    """
    fwd = request.headers.get("x-forwarded-for", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


limiter = RateLimiter()
