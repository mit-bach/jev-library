# Run the example locally

The published site is static. The only thing you can run from this repository is
the harness itself, and it is designed to run **locally, in a loopback-bound,
synthetic-only container, with no provider key by default**.

!!! warning "No provider key needed"

    The default flow is a dry run: a local deterministic simulator stands in for
    the real Jev response. The only real dependency is the Hermes redactor, so
    that the privacy boundary is exercised for real rather than stubbed.

## Option A: run the test suite

The tests never touch the network. HTTP-level tests spin up a local
`http.server` on an OS-assigned port and shut it down in teardown.

```sh
PYTHONPATH=src python -m pytest -q
```

Expect `117 passed`. If any test fails, stop — do not proceed to a trial run.

## Option B: dry-run a synthetic trial

Requires a Hermes checkout so the *real* redactor can be resolved.

```sh
PYTHONPATH=src HERMES_AGENT_ROOT=/path/to/hermes-agent \
python -m jev_shadow.trial \
  --turns examples/turns.jsonl \
  --out /tmp/jev-shadow-events.jsonl
```

Dry run makes **no network call**. It prints an aggregate-only summary — tier
counts, match rate, skip/error counts, total cost, p50/p95 latency — and never
prompts or state.

If no redactor can be resolved, the trial exits non-zero with a one-line
diagnostic naming the fix and writes **no** events file. That is intentional:
writing skipped-only events would look like something ran.

## Option C: synthetic-only container

The container below is bound to loopback, has no provider key, and depends only
on the standard library at runtime. It runs the suite and a dry-run trial
against synthetic fixtures.

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir "pytest>=7"
# No TYPESAFE_API_KEY: the default flow is a dry run against the simulator.
ENV PYTHONPATH=/app/src
CMD ["python", "-m", "pytest", "-q"]
```

```sh
docker build -t jev-shadow-example .
# Loopback-only publish, no key injected.
docker run --rm -p 127.0.0.1:8000:8000 jev-shadow-example
```

Keep it loopback-bound. If you expose anything, expose it to yourself only.

## Verify the container independently

Do not trust the build log. Check three things:

```sh
# 1. The suite really passed inside the container.
docker run --rm jev-shadow-example python -m pytest -q

# 2. The fixture result is the expected synthetic outcome.
docker run --rm jev-shadow-example \
  python -c "import json,pathlib;print(pathlib.Path('examples/turns.jsonl').read_text().count(chr(10)),'turns')"

# 3. No provider key is present in the container environment.
docker run --rm jev-shadow-example python -c \
  "import os;print('TYPESAFE_API_KEY' in os.environ)"
```

The last check must print `False`. If it prints `True`, remove the key before
running anything else.

## What this does not do

It does not stand up a switchyard, a Prometheus target, or a Grafana instance,
and it does not attach anything to the routing host. See
[integration](integration.md) if you want to attach it for real, and
[measurement limits](measurement-limits.md) before you read anything into the
numbers.
