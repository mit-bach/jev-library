"""Minimal runner for prompt-driven browser tests.

The prompt is the test steps. Jev is the fast executor. The `verify`
callback is the verdict, in plain deterministic code.

Never trust the agent's "DONE" — check the page yourself.
"""

import time

from dotenv import load_dotenv

from jev_ultrafast import Agent

load_dotenv()


def run_test(name, url, goal, verify):
    """Run one prompt-driven test. Returns True on PASS, False on FAIL."""
    print(f"== {name} ==")
    t0 = time.perf_counter()
    agent = Agent(url, goal)
    try:
        for state in agent.run():
            last = state["history"][-1] if state["history"] else {}
            print(f"  {state['elapsed_ms']:>7}ms  {state['status']:<8} {last.get('action', '')}")
    finally:
        # Fresh snapshot after the loop, same pattern as
        # browser-use/jev-ultrafast examples/flights.py
        snap = agent.snapshot()
        agent.close()

    page, status = snap["page"], snap["status"]
    elapsed = time.perf_counter() - t0
    print(f"  agent finished: {status}")

    try:
        verify(page)
    except AssertionError as e:
        print(f"FAIL {name} ({elapsed:.1f}s): {e}")
        return False
    print(f"PASS {name} ({elapsed:.1f}s)")
    return True
