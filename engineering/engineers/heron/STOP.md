# Stop

Heron, 2026-10-01. Measurement pass. No peers. Nothing spawned. Nothing written outside this workspace. `Deployment/` was not created. The library corpus, `RUNNING.md`, `AGENT-LOG.md`, `KEPT.md`, `CAST.md`, `cast/`, and `prompts/` were not edited.

The essay’s architecture diagram is treated as Archer Hume’s reconstruction. Sparse experts stay an inference.

## Files this pass leaves

- `EVIDENCE-INDEX.md` — one section per dataset or essay, plus the RLCD quotes and the social claims that have no file.
- `SOURCES.md` — URLs, status, and local paths.
- `STOP.md` — this file.
- `data/archerhume/` — the eleven JSON files that exist.
- `data/probe-log/` — HTTP transcripts and working extracts. Not the product.
- `captures/` — the essay text and the writeups that were opened.

## Linked JSON

None of the eleven JSON files linked from the essay returned 404. All returned HTTP 200.

| File | Bytes | Last-Modified |
| --- | ---: | --- |
| `data/archerhume/evidence.json` | 70157 | Wed, 30 Sep 2026 20:58:32 GMT |
| `data/archerhume/followup-trials.json` | 222083 | Wed, 30 Sep 2026 23:23:03 GMT |
| `data/archerhume/followup-summary.json` | 15296 | Wed, 30 Sep 2026 19:36:25 GMT |
| `data/archerhume/calibration.json` | 152269 | Wed, 30 Sep 2026 23:23:23 GMT |
| `data/archerhume/latency-rerun.json` | 48958 | Wed, 30 Sep 2026 23:23:17 GMT |
| `data/archerhume/tokenizer-fingerprint.json` | 279399 | Wed, 30 Sep 2026 23:23:15 GMT |
| `data/archerhume/context-limit.json` | 16999 | Wed, 30 Sep 2026 23:23:25 GMT |
| `data/archerhume/option-injection.json` | 127175 | Thu, 01 Oct 2026 15:57:10 GMT |
| `data/archerhume/output-token-accounting.json` | 321176 | Wed, 30 Sep 2026 21:51:59 GMT |
| `data/archerhume/option-count-latency.json` | 1575375 | Wed, 30 Sep 2026 23:23:19 GMT |
| `data/archerhume/option-position.json` | 156163 | Wed, 30 Sep 2026 23:23:27 GMT |

`option-count-latency.json` is the large one, 1.5 MB. It is kept. Its keys and the medians are in `EVIDENCE-INDEX.md`. The bodies are not pasted.

SHA-256 of each file is in the index.

## What returned 404

The directory is not a listing. These returned HTTP 404:

- `https://archerhume.com/research/`
- `https://archerhume.com/research/jev`
- `https://archerhume.com/research/jev/`
- `https://archerhume.com/sitemap-0.xml` exists but names only `/` and `/about/`. It does not name the JSON.

No linked essay filename 404’d. The names below were probes, not links from the essay. Every one returned HTTP 404:

`index.json`, `manifest.json`, `probes.json`, `study.json`, `methods.json`, `benchmarks.json`, `fresh-math.json`, `fresh_math.json`, `fresh-math-results.json`, `math.json`, `mmlu.json`, `visibility.json`, `determinism.json`, `noise.json`, `dup.json`, `iia.json`, `option-order.json`, `option_order.json`, `type-preamble.json`, `latency.json`, `token-accounting.json`, `tokenizer.json`, `context.json`, `relational.json`, `followup.json`, `summary.json`, `raw.json`, `records.json`, `requests.json`, `responses.json`, `benchmark.json`, `mmlu-sample.json`, `generated-math.json`, `fresh_math_results.json`, `visibility-trials.json`, `type_preamble.json`, `outputs.json`, `factual.json`, `checks.json`, `notes.json`, `latency-sweeps.json`, `server-time.json`, `catalog.json`, `files.json`, `bundle.json`, `evidence-bundle.json`, `all.json`, `data.json`, `results.json`, `option-interaction.json`, `fake-option.json`, `token-fingerprint.json`, `tokenizer-probes.json`, `context-limit-trials.json`, `calibration-mmlu.json`, `mmlu-calibration.json`, `item-level.json`, `predictions.json`, `README.md`, `index.html`.

Names that appear inside `evidence.json` as local sources, and that are not on the site either (HTTP 404):

`bench_results.jsonl`, `bench2_results.jsonl`, `calls.jsonl`, `fresh_math_results.json`, `fingerprint_results.json`, `fingerprint2_results.json`, `probe.py`, `bench.py`.

`https://cdn.archerhume.com/research/jev/evidence.json` did not resolve. `https://raw.githubusercontent.com/blowxian/jev-fanout-bench/main/README.md` returned 404, so that bench is not in the index. `https://alexmolas.com/2026/09/23/jev-cant-be-calibrated/` returned 404, so that argument was not opened.

## Captures

`captures/jevs-architecture-unmasked.md` (42,471 bytes) is the essay extract. The header says the architecture diagram is the author’s reconstruction.

The other files in `captures/` are the writeups listed in `SOURCES.md`. The two large arXiv HTML files (`arxiv-2609.29769.html` at 1,666,416 bytes and `arxiv-2609.29429.html` at 1,127,689 bytes) are kept whole. The index quotes the abstract and the calibration paragraphs, not the tables.

## Not proved

- No public tokenizer matches the 421 stored probes. The essay’s “192 tokenizers / o200k / Qwen 348 of 415” comparison is not in the JSON.
- Sparse experts are not observed.
- RLCD’s loss is not published. The primer and the TechCrunch sentence do not use the same preposition, and only TechCrunch says the data are exclusively synthetic.
- `ayautomate.html` and the Barg Labs pointer were saved and not reduced to figures.
- Yifan Lan’s list of 137 robustness entries was used as a finding aid. The entries not opened in `EVIDENCE-INDEX.md` were not re-measured.
