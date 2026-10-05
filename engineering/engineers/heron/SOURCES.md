# Sources

Fetched 2026-10-01 with curl. No browser. No Firecrawl. The TypeSafe launch page is a Framer document, and the article text is in the HTML, so it was not a shell.

The primer comparison uses the local snapshot `corpus/01-primary-typesafe/introduction/machine-learning-primer.md`. The live markdown at the URL below was byte-identical (6,693 bytes).

Parent HTML, read and not rewritten: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/originals/pages/archerhume-jevs-architecture-unmasked.html`.

## Archer’s measurement files

All eleven names linked from the essay returned HTTP 200. Directory listing `https://archerhume.com/research/jev/` returned HTTP 404, an HTML error page, not a file list. The sitemap lists only `/` and `/about/`.

| File | URL | Bytes |
| --- | --- | ---: |
| `data/archerhume/evidence.json` | https://archerhume.com/research/jev/evidence.json | 70157 |
| `data/archerhume/followup-trials.json` | https://archerhume.com/research/jev/followup-trials.json | 222083 |
| `data/archerhume/followup-summary.json` | https://archerhume.com/research/jev/followup-summary.json | 15296 |
| `data/archerhume/calibration.json` | https://archerhume.com/research/jev/calibration.json | 152269 |
| `data/archerhume/latency-rerun.json` | https://archerhume.com/research/jev/latency-rerun.json | 48958 |
| `data/archerhume/tokenizer-fingerprint.json` | https://archerhume.com/research/jev/tokenizer-fingerprint.json | 279399 |
| `data/archerhume/context-limit.json` | https://archerhume.com/research/jev/context-limit.json | 16999 |
| `data/archerhume/option-injection.json` | https://archerhume.com/research/jev/option-injection.json | 127175 |
| `data/archerhume/output-token-accounting.json` | https://archerhume.com/research/jev/output-token-accounting.json | 321176 |
| `data/archerhume/option-count-latency.json` | https://archerhume.com/research/jev/option-count-latency.json | 1575375 |
| `data/archerhume/option-position.json` | https://archerhume.com/research/jev/option-position.json | 156163 |

SHA-256 and Last-Modified are in `EVIDENCE-INDEX.md`. The HTTP log is `data/probe-log/curl-get-2.jsonl` and `data/probe-log/curl-known.txt`.

## Primary TypeSafe text

| Local file | URL | Role |
| --- | --- | --- |
| `captures/docs-primer-live.md` | https://docs.typesafe.ai/introduction/machine-learning-primer.md | Live primer. Byte-identical to the local snapshot. |
| `captures/docs-system-one.md` | https://docs.typesafe.ai/concepts/system-one.md | “Optimized against outcomes.” Group calibration, not a single-case guarantee. |
| `captures/docs-models.md` | https://docs.typesafe.ai/models.md | `jev-1.13.0`, 64k/32k limits, RLCD, not trained on customer requests. |
| `captures/typesafe-launch.html` | https://typesafe.ai/blog/introducing-system-one-models-and-jev | 15 September 2026 launch. RLCD name, parallel output, “can’t hallucinate.” |
| `captures/hn-49717558.html` | https://news.ycombinator.com/item?id=49717558 | Almeida (`CompleteSkeptic`): architecture unpublished; strings not allowed as outputs. |
| `captures/techcrunch-2026-09-18.html` | https://techcrunch.com/2026/09/18/a-new-kind-of-ai-model-from-a-chatgpt-inventor-is-thrilling-developers/ | “From calibrated decisions,” exclusively synthetic data, architecture tight-lipped. |

## Essay and third-party measurements that were opened

| Local file | URL | What it is |
| --- | --- | --- |
| `captures/jevs-architecture-unmasked.md` | https://archerhume.com/posts/jevs-architecture-unmasked/?v=3 | Text extract. Diagram marked as the author’s reconstruction. |
| `captures/willkelly-report.md` | https://raw.githubusercontent.com/WillKelly/jev-evaluation/main/runs/full-20260919/report.md | 123,805-request preregistered report, 2026-09-19. |
| `captures/willkelly-readme.md` | https://raw.githubusercontent.com/WillKelly/jev-evaluation/main/README.md | Summary of that run. |
| `captures/jujumilk3-findings.md` | https://raw.githubusercontent.com/jujumilk3/jev-calibration-audit/main/FINDINGS.md | Seoul audit, 2026-09-18. |
| `captures/jujumilk3-readme.md` | https://raw.githubusercontent.com/jujumilk3/jev-calibration-audit/main/README.md | Scope of that audit. |
| `captures/sacco-tiers-findings.md` | https://raw.githubusercontent.com/SamuelSacco/jev-exploration/main/lab/tiers/FINDINGS.md | Difficulty-tier ECE. |
| `captures/sacco-readme.md` | https://raw.githubusercontent.com/SamuelSacco/jev-exploration/main/README.md | Ledger around those runs. |
| `captures/yodablocks-readme.md` | https://raw.githubusercontent.com/yodablocks/jev-orderby-bench/main/README.md | Ranking gates, 18–19 September 2026. |
| `captures/qualiteg-readme.md` | https://raw.githubusercontent.com/qualiteg/jev-typesafe-demo/main/README.md | Tokyo latency, 2026-09-28. |
| `captures/wallerchen-readme.md` | https://raw.githubusercontent.com/WallerChen/jev-measured/main/README.md | OpenRouter client latency and model-id split. |
| `captures/themsquared-readme.md` | https://raw.githubusercontent.com/themsquared/jev-benchmark/main/README.md | n=60 tool-call risk, ECE dominated by one bin. |
| `captures/open-jev-inference-latency.md` | https://raw.githubusercontent.com/Zefan-Cai/Open-Jev/main/docs/inference-latency.md | Remote Jev vs local 2B. Warns against reading architecture from latency. |
| `captures/archestra-100-calls.html` | https://archestra.ai/blog/we-tested-jev-on-100-real-agent-calls | 337 judged decisions, option-order on 3-way labels. |
| `captures/primeline-preregistered.html` | https://primeline.cc/blog/typesafe-jev-pre-registered-test | Failure-mode bars, about 9,750 calls. |
| `captures/zenodo-23032384.html` | https://zenodo.org/records/23032384 | ChaosNLI preregistration record. |
| `captures/arxiv-2609.37647.html` | https://arxiv.org/html/2609.37647 | 346,009-request evaluation. Abstract used; tables not reduced. |
| `captures/arxiv-2609.29769.html` | https://arxiv.org/html/2609.29769 | Rubric-judge comparison. Abstract used. |
| `captures/arxiv-2609.29429.html` | https://arxiv.org/html/2609.29429 | Alignment-failure ECE, pooled vs per benchmark. |
| `captures/yfarmx-jev.html` | https://yfarmx.com/ai/llms/jev/ | 50-probe tokenizer signature measured 18 September 2026. The page also times a support-inbox call. An X post pointing here said “31 timed calls”; that count was not checked in the HTML. |
| `captures/systemonemodels-jev-architecture.html` | https://systemonemodels.org/guides/jev-architecture/ | Guide that separates five public statements from inference. Updated 22 September 2026. |
| `captures/awesome-jev-robustness-readme.md` | https://raw.githubusercontent.com/Yifan-Lan/awesome-jev-robustness/main/README.md | Index of 137 entries as of 2026-10-01. Not a measurement. Used as a finding aid. |
| `captures/orcarouter-2026-09-22.md` | https://x.com/OrcaRouter/status/2102318172577911068 | Post with numbers and no data file. Saved so the RLCD wording is quotable. Not a result. |
| `captures/barglabs-readme.md` | https://raw.githubusercontent.com/BargLabs/jev-judge-calibration/main/README.md | Pointer only. Result tables not read. |
| `captures/ayautomate.html` | https://www.ayautomate.com/blog/jev-vs-llm-benchmark | Saved. Figures not extracted into the index. |
| `captures/victordibia.html` | https://victordibia.com/explainers/jev/ | Saved. Almeida sentences used in the index come from the Hacker News capture, not from this paraphrase. |

## Looked up and not used as measurements

- `https://api.github.com/users/archerhume/repos?per_page=100` returned 22 repositories. None is the Jev study. The raw API body was deleted after the names were checked. It is not a writeup.
- `https://raw.githubusercontent.com/blowxian/jev-fanout-bench/main/README.md` returned HTTP 404. A search snippet described a fan-out bench. Those numbers are not in the index.
- `https://alexmolas.com/2026/09/23/jev-cant-be-calibrated/` returned HTTP 404. The “can’t be calibrated” argument was not opened.
- Public GitHub user ArcherHume is not the host of the JSON. The JSON host is archerhume.com.

## Probe log

`data/probe-log/` holds the HTTP transcripts, the JSON shape dump, and `numeric-extract.txt`. Those are working notes. The claims in `EVIDENCE-INDEX.md` were checked against the JSON, not against the dump alone.
