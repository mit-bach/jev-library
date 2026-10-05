# Jev Probe

> An empirical consistency & robustness exploration harness comparing **Jev** against baseline LLMs under real-world input perturbations.

![Jev Probe Dashboard](assets/dashboard.png) <!-- Add your dashboard image here -->

## Overview

`jev-probe` is an interactive, empirical exploration tool designed to test the real-world production viability of **Jev** (a purpose-built classification model by TypeSafe AI with calibrated probability outputs) against general-purpose LLMs across real-world edge cases. 

Instead of measuring simple accuracy on clean datasets, this harness measures **Invariance**—how often a model flips its decision when exposed to meaning-preserving noise.

### Key Metrics Tracked
- **Invariance Failure Rate:** How often the model flips its answer when subjected to irrelevant noise (lower is better).
- **Confidence Drop:** How much certainty the model loses when exposed to perturbations.
- **Compute Cost & Latency:** Real-time token economics and millisecond latency tracking.

### Modification Categories Explored
1. **Surface Noise:** Typos, casing changes, dropped characters, and keyboard slips.
2. **Position Bias:** Shuffling the order of input criteria or options.
3. **Semantic Perturbations:** Deep paraphrasing that preserves the original intent.
4. **Position & Padding:** Adding irrelevant whitespace, HTML tags, or filler text.
5. **Realistic Mess & OCR:** Simulating poor OCR extraction and formatting destruction.
6. **Adversarial Probing:** Explicit prompt injection and edge-case instructions.

---

## Architecture & Tech Stack

This is a modern, zero-state Python web application built for maximum robustness:
- **Backend:** `FastAPI` with an asynchronous testing pipeline.
- **LLM Integration:** `litellm` handles multi-provider baseline API calls (OpenAI, Anthropic, Groq, etc.) with strict exponential backoff and rate limit parsing.
- **Storage:** `DuckDB` serves as a local, immutable audit log of every API call and decision margin.
- **Frontend:** `HTMX` & `Alpine.js` paired with raw CSS variables. The frontend contains zero state; it is entirely driven by Server-Sent Events (SSE) streaming real-time HTML updates from the Python generator.

![Response Viewer](assets/drilldown.png) <!-- Add your drilldown image here -->

---

## Quickstart

### 1. Prerequisites
- Python 3.11+
- [`uv`](https://github.com/astral-sh/uv) package manager

### 2. Environment Setup
```bash
# Clone the repository
git clone https://github.com/your-org/jev-probe.git
cd jev-probe

# Sync dependencies and virtual environment
uv sync
```

### 3. API Keys
Create a `.env` file in the root directory with the API keys for the providers you want to test against (e.g., Groq, OpenAI).
```env
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-...
TYPESAFE_API_KEY=...
```

### 4. Running the Dashboard
```bash
uv run python run.py web
```
Navigate to `http://localhost:8000` to start exploring.

## Development

We use strictly enforced Pyright type narrowing and Ruff formatting. Before committing, ensure the pipeline is clean:
```bash
uv run ruff check . --fix
```

---
*Note: This system issues real API calls to measure true latency and cost. Ensure you are aware of provider billing limits when running large scenario matrices.*
