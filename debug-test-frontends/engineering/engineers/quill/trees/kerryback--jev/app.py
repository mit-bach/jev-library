"""FastAPI wrapper around the Jev playground.

The web layer is deliberately thin -- it exists so Jev can be driven from a
browser, not because there is anything to learn from it here.

`GET /` serves the page. `POST /api/run` forwards a state and a question set to
Jev and returns the typed answers. Errors from the SDK are passed through with
their own wording, because they already say the useful thing
('Question "tone" requires "criteria".') and rewording them would only put a
second vocabulary between the reader and the API.

`/api/run` is rate limited: the page is public and every run spends money. See
limits.py.
"""

from __future__ import annotations

import json

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

import config
import jev
import limits

app = FastAPI(title="Jev playground", docs_url="/docs")


class RunRequest(BaseModel):
    state: object
    questions: dict


@app.get("/healthz")
async def healthz():
    """Koyeb's health check. Never calls Jev, so it costs nothing."""
    return {"ok": True, "model": config.MODEL, **limits.limiter.snapshot()}


@app.post("/api/run")
async def api_run(req: RunRequest, request: Request):
    if not req.questions:
        raise HTTPException(400, "Add at least one question.")

    refused = limits.limiter.check_and_count(limits.client_ip(request))
    if refused:
        raise HTTPException(429, refused)

    try:
        return await jev.run(req.state, req.questions)
    except jev.TypeSafeError as exc:
        raise HTTPException(400, str(exc)) from exc
    except RuntimeError as exc:                     # missing key
        raise HTTPException(500, str(exc)) from exc


@app.get("/", response_class=HTMLResponse)
async def index() -> HTMLResponse:
    page = (config.ROOT / "page.html").read_text()
    # ensure_ascii=False so names keep their real characters in the page source;
    # it is served as UTF-8 either way.
    dump = lambda obj: json.dumps(obj, ensure_ascii=False)
    page = (
        page.replace("__PRESETS__", dump(config.PRESETS))
        .replace("__TEMPLATES__", dump(config.TEMPLATES))
        .replace("__DEFAULT__", dump(config.DEFAULT_PRESET))
        .replace("__NEW__", dump(config.NEW_PRESET))
    )
    return HTMLResponse(page)
