// ローカル中継サーバ（依存なし・Node 20+）
//  - public/ の画面を配信する
//  - POST /api/jev を TypeSafe の /v1/systemone へ中継する（APIキーはサーバ側だけが持つ）
// TypeSafe API はブラウザからの直接呼び出し（CORS）を受け付けないため、この中継が必要。
import http from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDotEnv, typesafeConfig, callSystemOne } from "./lib/typesafe.mjs";
import { mockSystemOne } from "./lib/mock-jev.mjs";

const root = dirname(fileURLToPath(import.meta.url));
loadDotEnv(root);
const cfg = typesafeConfig();
const MOCK = process.argv.includes("--mock"); // 配線確認用の偽 Jev（本物の Jev は呼ばない）
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "127.0.0.1"; // 既定はこのPCからのみ。LANに公開すると誰でもあなたのキーで呼べる点に注意
const PUBLIC = join(root, "public");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon",
};

function sendJson(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}

function readBody(req, limit = 2_000_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) {
        reject(Object.assign(new Error("リクエストが大きすぎます"), { status: 413 }));
        req.destroy();
      } else chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function handleJev(req, res) {
  if (!cfg.apiKey && !MOCK) {
    return sendJson(res, 503, { error: { message: "TYPESAFE_API_KEY が設定されていません。.env に書いてからサーバを再起動してください。" } });
  }
  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch (e) {
    return sendJson(res, e.status || 400, { error: { message: e.status ? e.message : "JSON を解釈できません" } });
  }
  const count = payload?.questions && typeof payload.questions === "object" ? Object.keys(payload.questions).length : 0;
  if (!count || payload.state === undefined) {
    return sendJson(res, 400, { error: { message: "state と questions（1問以上）が必要です" } });
  }
  const r = MOCK
    ? await mockSystemOne({ state: payload.state, questions: payload.questions })
    : await callSystemOne({ ...cfg, state: payload.state, questions: payload.questions });
  const tokens = r.data?.usage?.input_tokens ?? "-";
  console.log(`[jev] ${count}問 ${Math.round(r.latencyMs ?? 0)}ms status=${r.status} 入力=${tokens}tok 試行=${r.attempts}`);
  if (r.ok) return sendJson(res, 200, { ...r.data, latencyMs: r.latencyMs, attempts: r.attempts });
  return sendJson(res, r.status || 502, { error: { message: r.error, status: r.status, detail: r.data } });
}

async function handleStatic(req, res, pathname) {
  const rel = pathname === "/" ? "index.html" : decodeURIComponent(pathname).replace(/^\/+/, "");
  const file = normalize(join(PUBLIC, rel));
  if (file !== PUBLIC && !file.startsWith(PUBLIC + sep)) return sendJson(res, 403, { error: { message: "forbidden" } });
  try {
    const data = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(req.method === "HEAD" ? undefined : data);
  } catch {
    sendJson(res, 404, { error: { message: "not found" } });
  }
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  try {
    if (pathname === "/api/config" && req.method === "GET") {
      return sendJson(res, 200, { hasKey: MOCK || Boolean(cfg.apiKey), model: MOCK ? "mock" : cfg.model, mock: MOCK });
    }
    if (pathname === "/api/jev" && req.method === "POST") return await handleJev(req, res);
    if (req.method === "GET" || req.method === "HEAD") return await handleStatic(req, res, pathname);
    sendJson(res, 405, { error: { message: "method not allowed" } });
  } catch (e) {
    console.error(e);
    sendJson(res, 500, { error: { message: e.message } });
  }
});

server.listen(PORT, HOST, () => {
  const shown = HOST === "0.0.0.0" ? "localhost" : HOST;
  console.log(`Jev × マインスイーパー: http://${shown}:${PORT}`);
  if (MOCK) console.log("モックで起動：/api/jev は本物の Jev ではなく、簡単な規則で答えます（配線確認用）");
  else console.log(cfg.apiKey ? `モデル: ${cfg.model}（APIキー設定済み）` : "APIキー未設定：ソルバー／手動モードのみ使えます（.env に TYPESAFE_API_KEY を設定）");
});
