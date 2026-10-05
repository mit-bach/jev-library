#!/usr/bin/env node
// Serves eval-ui/ and aggregates eval-results/**/*.json into /results.json
import { createServer } from "node:http";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const uiDir = join(root, "eval-ui");
const resultsDir = process.env.EVAL_RESULTS_DIR ?? join(root, "eval-results");
const port = Number(process.env.PORT ?? 4321);

const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

function readRuns(dir) {
  const runs = {};
  const history = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) continue;
    if (f.endsWith(".json")) {
      try {
        const rec = JSON.parse(readFileSync(p, "utf8"));
        runs[rec.promptId] = rec;
      } catch {}
    } else if (f === "history.jsonl") {
      for (const line of readFileSync(p, "utf8").split("\n").filter(Boolean)) {
        try {
          history.push(JSON.parse(line));
        } catch {}
      }
    }
  }
  return { runs, history };
}

// Benchmark prompts straight from evals/prompts.ts (the array literal is plain JS).
function loadPrompts() {
  try {
    const src = readFileSync(join(root, "evals", "prompts.ts"), "utf8");
    const start = src.indexOf("= [", src.indexOf("export const PROMPTS"));
    const end = src.lastIndexOf("];");
    if (start < 0 || end < 0) return [];
    return new Function(`return ${src.slice(start + 2, end + 1)}`)();
  } catch (e) {
    console.warn("could not read evals/prompts.ts:", e.message);
    return [];
  }
}

// eval-results/<mode>/<modelKey>/<prompt>.json  → series keyed "<mode>|<modelKey>"
function collect() {
  const series = {};
  const prompts = loadPrompts();
  if (!existsSync(resultsDir)) return { generatedAt: new Date().toISOString(), prompts, series };
  for (const mode of readdirSync(resultsDir)) {
    const modeDir = join(resultsDir, mode);
    if (!statSync(modeDir).isDirectory()) continue;
    for (const entry of readdirSync(modeDir)) {
      const dir = join(modeDir, entry);
      if (!statSync(dir).isDirectory()) continue;
      const { runs, history } = readRuns(dir);
      if (Object.keys(runs).length) series[`${mode}|${entry}`] = { mode, modelKey: entry, runs, history };
    }
  }
  return { generatedAt: new Date().toISOString(), prompts, series };
}

createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${port}`);
  if (url.pathname === "/results.json") {
    res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
    res.end(JSON.stringify(collect()));
    return;
  }
  const file = join(uiDir, url.pathname === "/" ? "index.html" : url.pathname);
  if (!file.startsWith(uiDir) || !existsSync(file) || statSync(file).isDirectory()) {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream", "cache-control": "no-store" });
  res.end(readFileSync(file));
}).listen(port, () => {
  console.log(`eval dashboard → http://localhost:${port}   (results from ${resultsDir})`);
});
