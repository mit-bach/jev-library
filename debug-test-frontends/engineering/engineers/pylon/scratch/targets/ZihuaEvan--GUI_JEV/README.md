# GUI JEV Harness

An auditable, screenshot-in/coordinate-out harness that uses TypeSafe JEV as a closed-set decision layer during recursive GUI image search.

> The current TypeSafe JEV Evaluation API defines text/JSON state and typed probability outputs, but no image-input protocol or official vision capability. This project therefore uses a separately configured vision-capable model to describe each grid tile, then asks `typesafe-ai/jev` to choose among those descriptions. Pixels are never sent to JEV.

## How it works

For each recursion layer, the harness divides the current crop into a deterministic grid, draws thin boundaries, and sends that annotated crop to a vision model through Vercel AI Gateway. Tile IDs follow zero-based row-major order. The vision prompt is intentionally goal-blind: it describes visible text and controls but cannot choose a tile. JEV receives the user goal plus those neutral descriptions and returns a `choice` probability distribution over the tile IDs and `NO_MATCH`. Local code validates the closed candidate set, raw numeric types, approximate probability sum, response model, and argmax; it then applies confidence and margin gates, maps the selected tile back to original-image pixels, and either recurses or refuses.

The harness does not capture a live screen or execute clicks. A successful result contains a point and a bounding box in the input image's raster coordinate system. The caller owns screenshot capture, display scaling, freshness checks, and click execution.

## Install

Python 3.11 or newer is required.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -e '.[dev]'
```

## Online usage

Create an AI Gateway key and choose a current model that supports both image input and structured output. The vision model is deliberately not hardcoded because Gateway availability changes.

```bash
export AI_GATEWAY_API_KEY='...'
export JEV_GUI_VISION_MODEL='provider/vision-model-id'

jev-gui locate screenshot.png \
  --goal 'the Settings button' \
  --rows 3 \
  --columns 3 \
  --max-depth 6 \
  --target-width 32 \
  --target-height 32 \
  --trace-out trace.json \
  --annotated-out located.png
```

`AI_GATEWAY_API_KEY` is read only from the environment. Online mode calls `POST /v1/chat/completions` for neutral visual descriptions and `POST /v1/evaluate` with model `typesafe-ai/jev` for each tile decision.

## Local OpenJev visual mode

[OpenJev](https://huggingface.co/AlexWortega/openjev) is an independent Qwen3.5 NLI classifier, not TypeSafe JEV. Its visual checkpoints can score screenshot pixels directly, so this mode does not use OCR, XML, accessibility metadata, or a separate captioning model.

```bash
python -m pip install -e '.[openjev]'

hf download AlexWortega/openjev \
  --include 'qwen3.5-0.8b-nli-v2s-long/*' \
  --local-dir /path/to/openjev

jev-gui locate screenshot.png \
  --goal 'the Settings icon' \
  --openjev-model /path/to/openjev/qwen3.5-0.8b-nli-v2s-long \
  --openjev-device auto \
  --openjev-known-target \
  --beam-width 4 \
  --rows 2 --columns 2 \
  --max-depth 5 \
  --target-width 64 --target-height 64
```

`--beam-width 4` enables global beam search. Every active branch expands every positive-probability tile; the harness adds `log(tile_probability)` to the parent score and globally retains the best four children. The default is `1`, which preserves the original greedy behavior. Beam traces use schema version 2 and include every parent decision, candidate score, global retention decision, terminal leaf, and winner.

For each tile, the backend evaluates the NLI hypothesis that the requested GUI target is visible in that crop, then locally normalizes `P(entailment)` across candidates. Open-world mode also evaluates a `NO_MATCH` hypothesis on the whole current region. For benchmarks that guarantee target presence, pass `--openjev-known-target` to disable that opposite-polarity hypothesis. These cross-candidate probabilities are an experimental Harness construction, not TypeSafe Choice probabilities or an OpenJev calibration guarantee.

## Offline replay

Offline mode is deterministic and makes no network calls. It requires a vision manifest and decision script keyed by crop path.

```bash
python scripts/make_demo.py

jev-gui locate examples/demo_screenshot.png \
  --goal 'the Settings button' \
  --offline \
  --vision-manifest examples/demo_vision.json \
  --decision-script examples/demo_decisions.json \
  --rows 2 --columns 2 --max-depth 2 \
  --target-width 32 --target-height 32 \
  --trace-out examples/demo_trace.json \
  --annotated-out examples/demo_result.png

jev-gui validate-trace examples/demo_trace.json \
  --image examples/demo_screenshot.png
```

A manifest may include `image_sha256`; when present, replay fails if the screenshot differs. The decision script also requires an exact `goal` field, so it cannot be replayed as evidence for another task. See `scripts/make_demo.py` for the minimal schema.

## Output contract

Standard output is JSON. `status` is one of `located`, `refused`, `limit_reached`, or `error`. A coordinate is emitted only for `located`; refusal and limit results keep `point` and `bbox` null. Every layer records the original-pixel crop rectangle, candidate tiles, neutral descriptions, complete JEV probability distribution, selected path, and gate decision. Secrets and image base64 are not written to traces.

Default thresholds are starting points, not calibrated guarantees. `NO_MATCH`, low top probability, a small top-two margin, malformed distributions, and recursion limits all fail closed.

## Development

```bash
ruff check .
ruff format --check .
pytest
python -m build
```

Tests use `httpx.MockTransport` and offline fixtures; they never call paid APIs. The adapters match the documented request schemas, but a live AI Gateway smoke test was not run because no credential was provided.

## Prior art and differentiation

The implementation borrows one principle from [Jev Ultrafast](https://github.com/browser-use/jev-ultrafast), [typesafe-adblock](https://github.com/realZachi/typesafe-adblock), and [CUA-S1 Forms](https://huggingface.co/cua-ai/cua-s1-forms): application code owns a bounded candidate set and the model returns probabilities over candidate IDs.

It deliberately does not copy their execution design. Jev Ultrafast selects actions over indexed DOM nodes, typesafe-adblock independently classifies prefiltered DOM elements, and CUA-S1 Forms is a local 706K-parameter text classifier for accessibility-derived form fields. This project instead performs hierarchical image-region search, separates goal-blind visual description from goal-aware TypeSafe JEV choice, emits only a raster bbox/point, and never mutates the GUI. The detailed code-level comparison is in the technical report.

## Scope and limitations

The final box is the remaining search region, not a guaranteed control bounding box. Uniform grids can split a target across tiles, duplicate-looking controls remain ambiguous, and a vision description error can propagate into JEV's decision. Production callers should re-capture the screen before clicking and, when possible, snap the result to a DOM, accessibility, OCR, or detector-provided element box.

The pinned 12-case ScreenSpot smoke set contains three Windows text targets, three Windows icon targets, three iOS text targets, and three iOS icon targets. Dataset images are evaluation assets, not training data. With the local OpenJev 0.8B checkpoint, the 32-pixel configuration reached 9/12 point hits: text 6/6 and icon 3/6. This is a smoke result, not a full benchmark score. See the [evaluation report](evals/openjev-0.8b-screenspot12-final/REPORT.md).

For the complete 1,272-case ScreenSpot test split, install `.[openjev,eval]`, download all three parquet shards, run `scripts/prepare_screenspot_full.py`, then start `scripts/eval_screenspot_openjev.py --beam-width 4`. The evaluator writes `results.json` after every case; rerun the identical command with `--resume` after an interruption. Beam width four may require up to `1 + 4(D-1)` decision calls for depth `D`, so test `--start 0 --end 50` before the full run. See the command block in the technical report for the full invocation.

The design, reference comparison, full-run commands, and evaluation evidence are documented in [the Chinese technical report](docs/technical-report.zh-CN.md).

## Sources

- [Vercel: Jev launch](https://vercel.com/blog/ai-gateway-jev-model-launch)
- [Vercel: Evaluation API](https://vercel.com/docs/ai-gateway/modalities/evaluation)
- [Vercel: vision input](https://vercel.com/docs/ai-gateway/inputs-and-tools/vision)
- [awesome-jev](https://github.com/yibie/awesome-jev)
- [Jev Ultrafast](https://github.com/browser-use/jev-ultrafast)
- [typesafe-adblock](https://github.com/realZachi/typesafe-adblock)
- [CUA-S1 Forms model card](https://huggingface.co/cua-ai/cua-s1-forms)
- [CUA-S1 source](https://github.com/trycua/cua/tree/main/libs/cua-s1)
- [OpenJev](https://huggingface.co/AlexWortega/openjev)
- [ScreenSpot](https://huggingface.co/datasets/bevaya/ScreenSpot)
- [PlayJev](https://github.com/OmniJev/PlayJev)
