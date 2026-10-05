"""Shared test fixtures: a real loopback HTTP server, and fake redactors.

No test in this suite talks to the real network. Transport-level tests use
this local server (bound to 127.0.0.1, OS-assigned port, torn down after each
test) so the actual wire path through ``urllib`` is exercised.
"""

from __future__ import annotations

import re
import threading
from collections.abc import Callable
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest


class _RecordingHandler(BaseHTTPRequestHandler):
    def do_POST(self) -> None:  # noqa: N802 - http.server naming convention
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        self.server.received_bodies.append(body)  # type: ignore[attr-defined]
        self.server.received_headers.append(dict(self.headers.items()))  # type: ignore[attr-defined]
        self.server.request_count += 1  # type: ignore[attr-defined]

        status, response_body, extra_headers = self.server.response_provider()  # type: ignore[attr-defined]
        delay = getattr(self.server, "delay_seconds", 0.0)
        if delay:
            threading.Event().wait(delay)
        self.send_response(status)
        for key, value in (extra_headers or {}).items():
            self.send_header(key, value)
        self.send_header("Content-Length", str(len(response_body)))
        self.end_headers()
        self.wfile.write(response_body)

    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        pass


ResponseProvider = Callable[[], tuple[int, bytes, dict[str, str] | None]]


@pytest.fixture
def make_server():
    servers: list[tuple[HTTPServer, threading.Thread]] = []

    def _make(response_provider: ResponseProvider, *, delay_seconds: float = 0.0) -> HTTPServer:
        server = HTTPServer(("127.0.0.1", 0), _RecordingHandler)
        server.response_provider = response_provider  # type: ignore[attr-defined]
        server.received_bodies = []  # type: ignore[attr-defined]
        server.received_headers = []  # type: ignore[attr-defined]
        server.request_count = 0  # type: ignore[attr-defined]
        server.delay_seconds = delay_seconds  # type: ignore[attr-defined]
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        servers.append((server, thread))
        return server

    yield _make

    for server, thread in servers:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)


def endpoint_for(server: HTTPServer) -> str:
    return f"http://127.0.0.1:{server.server_port}/v1/systemone"


_FAKE_PATTERNS = [
    re.compile(r"Bearer\s+[A-Za-z0-9._\-]+", re.IGNORECASE),
    re.compile(r"sk-[A-Za-z0-9]+"),
    re.compile(r"apikey_[A-Za-z0-9]+", re.IGNORECASE),
    re.compile(r"ghp_[A-Za-z0-9]+"),
    re.compile(r"AKIA[0-9A-Z]+"),
    re.compile(r"-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9 ]*PRIVATE KEY-----"),
    re.compile(r"(password|secret)\s*=\s*\S+", re.IGNORECASE),
]


def good_redactor(text: str) -> str:
    """Stands in for Hermes' ``redact_for_egress``: actually scrubs credentials."""
    redacted = text
    for pattern in _FAKE_PATTERNS:
        redacted = pattern.sub("[REDACTED]", redacted)
    return redacted


def leaky_redactor(text: str) -> str:
    """A redactor that fails to catch anything -- exercises the belt-and-braces check."""
    return text


def raising_redactor(text: str) -> str:
    raise RuntimeError("boom")
