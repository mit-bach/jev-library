# jev-browser-tests

Prompt-driven browser tests. No Selenium selectors, no coordinates.

The idea, in one line: **the prompt is the test steps, Jev is the fast
executor, deterministic code is the verdict.**

- [browser-use/jev-ultrafast](https://github.com/browser-use/jev-ultrafast)
  drives a real Chrome: Jev picks the operation and the target element in
  one fast round trip, instead of an LLM writing out coordinates.
- After the agent stops, a plain `verify(page)` function checks the real
  outcome — URL, visible text, element labels. The agent's "DONE" is never
  trusted on its own.

Target site for the demo: https://www.saucedemo.com (the standard
throwaway test shop).

## Setup

```bash
cd jev-browser-tests
uv sync
cp .env.example .env
# add TYPESAFE_API_KEY (https://typesafe.ai, starts at $5, no waitlist)
# add TEXT_MODEL_API_KEY (OpenRouter key, only used for typing into fields)
```

Chrome connects through Browser Harness (installed by `uv sync`). On the
first run, allow remote debugging when Chrome prompts.

## Run

```bash
uv run pytest              # one test per file in tests/
uv run --env-file .env python -m jev_browser_tests   # all three in a row
```

Each test prints the agent's steps, then `PASS`/`FAIL` with elapsed time.

## Add a new test

Copy `tests/test_login.py`, change the goal and the `verify` function:

```python
GOAL = "Do the thing. Stop when <visible end state>."

def verify(page):
    # page["url"], page["text"], page["actions"] (label/kind/value per control)
    assert <something checkable> in page["text"]
```

Rule of thumb: put the *navigation* in the prompt, put the *verdict* in
code. If it can't be asserted from the final page state, it's not a test.

## Honest limitations

- Needs paid API keys (TypeSafe for decisions, a small text model for
  typing). Each demo run costs a fraction of a cent, but it isn't free
  like Selenium.
- Agent navigation can be flaky — a different path each run, occasional
  wrong clicks. That's exactly why assertions stay in deterministic code
  and never in the prompt.
- jev-ultrafast is an MVP: shadow roots, iframes, canvas, file uploads
  and pop-up tabs are outside what its DOM reader handles. Plain HTML
  sites (like this demo) work best.
- Demo scale only: three happy-path tests, no retries, no reporting, no
  parallel runs. A real suite would need all of that.
