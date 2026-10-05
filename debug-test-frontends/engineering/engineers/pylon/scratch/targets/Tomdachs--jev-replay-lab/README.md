# Jev Replay Lab

**Measure Jev decisions before you automate them.** A local web workbench for labeled datasets, Choice / Score / Noul questions, threshold simulation, error inspection and run comparison. English and Japanese UI.

[日本語](README.ja.md) · [Data format](docs/format.md) · [Metric definitions](docs/metrics.md) · [Releases](https://github.com/Tomdachs/jev-replay-lab/releases)

## Try it

Requires **Node.js 24.19 or later in the 24.x line**. No API key is needed for the synthetic demo.

```sh
npx --yes --package https://github.com/Tomdachs/jev-replay-lab/releases/download/v0.1.0/jev-replay-lab-0.1.0.tgz jev-replay-lab
```

Open **http://127.0.0.1:4317**, choose **Load example**, then **Start replay**. Inspect mistakes and move the thresholds: recalculation uses saved results and makes no API calls. The sample is synthetic and demonstrates the application, not Jev accuracy.

The release tarball is the distribution; the unscoped npm registry name is not published. Download the tarball and `SHA256SUMS` from the same release to verify it before installation. The first `npx` invocation needs internet access to install dependencies; an installed application can run the demo and inspect saved results offline.

![Synthetic demo results and threshold simulator](docs/screenshot.png)

## What you can do

- Import JSONL, JSON arrays or UTF-8 CSV, with optional expected labels.
- Define up to 8 typed questions and evaluate up to 200 cases in one run.
- Inspect labeled accuracy, automation coverage, error among automated labeled cases, confusion matrices, Brier score, ECE and Score MAE. Missing labels and failed responses have explicit treatment.
- Simulate confidence/probability thresholds, including a two-sided Noul review band.
- Compare two saved runs of the same dataset, including decisions, status and probability/confidence changes.
- Export a complete JSON run, result CSV or simulation policy. Reimport runs without a key; imported provenance is always marked unverified.
- Keep dataset and question snapshots in local SQLite. Reopening the application preserves history; interrupted runs are never silently restarted.

## Live Jev

Set `TYPESAFE_API_KEY` in the **server environment** using your usual secret-management method, then restart. The provider selector enables live mode. Review the dataset, model and request count, and check the explicit consent box before starting. Do not paste a key into the browser or a dataset.

The official [`@typesafe-ai/sdk`](https://github.com/typesafe-ai/typesafe-sdk-js) calls only `https://api.typesafe.ai`. State and questions are sent; expected labels are not. One sequential request per case, 30 seconds per request, no automatic retries, one active run. Cancellation stops further requests but cannot reverse a request already processed by the provider. Live use may incur charges. Exact preflight token counts and monetary cost are not available; actual usage is recorded when returned.

**Verification boundary:** the SDK adapter is tested offline against controlled responses, including errors and cancellation. A successful live TypeSafe call has not been verified for v0.1.0 because no API credential was available in the development environment. Demo results are never used as evidence of model quality.

## Data and boundaries

Defaults: loopback HTTP on port 4317; data in `~/codex-data/jev-replay-lab/`. Override with `--port`, `--data-dir`, or `JEV_LAB_DATA_DIR`. `--help` lists options. The server does not automatically read `.env` files.

```sh
jev-replay-lab --port 4319 --data-dir /absolute/path/to/lab-data
```

The application is for a trusted, single-user local machine. It checks Host, Origin and a session token on writes. It has no remote login, multi-user isolation, analytics, external fonts, webhooks or business-action execution. Keep it on loopback; do not expose it through a public proxy. Keys and provider error bodies are not persisted. Imported state itself may contain sensitive information: the app is not a redaction service. JSON export contains inputs and labels; CSV contains labels and decisions.

The single writer holds an OS-released SQLite lock. Stop the server before copying the **entire data directory** for backup. Restore only while stopped. `lab.sqlite` contains data; SQLite sidecars belong to it. `writer-lock.sqlite` is a lock database, not a stale PID file, and can remain after shutdown. There is no deletion UI in v0.1.0; choose a new data directory for a fresh workspace. The initial storage and export schema is version 1.

## Development

```sh
npm ci
npm run build
npm start
```

After editing, rebuild and restart. Vite builds the React UI; a small Node HTTP server serves the built assets and official SDK adapter. Node's SQLite implementation avoids native-addon installation and a separate database service. The supported runtime is pinned in `.node-version`; development, packaged runtime and CI use the same major version.

```sh
npx playwright install --with-deps chromium
npm run check
npm run pack:check
```

CI runs unit/integration tests and packaged installation on Linux, Windows and macOS, plus Chromium desktop/mobile workflows on Linux. `pack:check` installs the actual tarball into a disposable directory and completes a 12-case demo through the packaged server. Browser tests use temporary data, with no live key. GitHub Releases are created only after the tag's CI gates pass. See [CONTRIBUTING](CONTRIBUTING.md) and [SECURITY](SECURITY.md).

## Why another evaluation tool?

[`jev-starter`](https://github.com/hamakyo/jev-starter) already provides policy and evaluation runners; [`daf-jev`](https://github.com/docxology/daf-jev) provides Python evaluation tools. This project's focus is an installable local UI for exploring your own datasets and thresholds. It does not claim to invent calibration or replace existing evaluation infrastructure. See [scope and research](docs/research.md).

MIT. Independent community project, not affiliated with TypeSafe AI. The application is open source; Jev is a separately hosted provider.
