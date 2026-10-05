// TypeSafe System One API を直接呼ぶ小さなクライアント（server.mjs と bench.mjs で共用）。
// 公式 SDK（@typesafe-ai/sdk）でも同じことができるが、依存なしで動かすため fetch で書いている。
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export function loadDotEnv(dir) {
  const file = join(dir, ".env");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m || line.trim().startsWith("#")) continue;
    const value = m[2].replace(/^(['"])(.*)\1$/, "$2");
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}

export function typesafeConfig() {
  return {
    apiKey: process.env.TYPESAFE_API_KEY || "",
    model: process.env.TYPESAFE_MODEL || "jev-latest",
    baseURL: (process.env.TYPESAFE_BASE_URL || "https://api.typesafe.ai").replace(/\/$/, ""),
  };
}

const RETRYABLE = new Set([408, 429, 500, 502, 503, 504, 529]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function describeError(status, data) {
  const detail = typeof data?.detail === "string" ? data.detail : data?.detail?.message || JSON.stringify(data?.detail ?? data ?? "");
  if (status === 401 || status === 403) return `APIキーが無効か未設定です（${detail}）`;
  if (status === 422) return `リクエストの形式エラー：${detail}`;
  if (status === 429) return "レート制限に達しました。少し待ってから再実行してください";
  if (status === 529) return "TypeSafe が混雑しています。少し待ってから再実行してください";
  return `HTTP ${status}：${detail}`;
}

/** POST /v1/systemone。429/529 などは指数バックオフで再試行する。 */
export async function callSystemOne({ apiKey, baseURL, model, state, questions, timeoutMs = 30000, maxAttempts = 4 }) {
  const body = JSON.stringify({ state, model, questions });
  let lastError = "";
  let lastStatus = 0;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    const t0 = performance.now();
    try {
      const res = await fetch(`${baseURL}/v1/systemone`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body,
        signal: ac.signal,
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
      const latencyMs = performance.now() - t0;
      if (res.ok) return { ok: true, status: res.status, data, attempts: attempt, latencyMs };
      lastStatus = res.status;
      lastError = describeError(res.status, data);
      if (!RETRYABLE.has(res.status) || attempt === maxAttempts) {
        return { ok: false, status: res.status, error: lastError, data, attempts: attempt, latencyMs };
      }
      const retryAfter = Number(res.headers.get("retry-after"));
      await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 400 * 2 ** (attempt - 1) + Math.random() * 200);
    } catch (e) {
      lastStatus = 0;
      lastError = e.name === "AbortError" ? `タイムアウト（${timeoutMs / 1000}秒）` : `接続エラー：${e.message}`;
      if (attempt === maxAttempts) break;
      await sleep(400 * 2 ** (attempt - 1));
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, status: lastStatus, error: lastError, attempts: maxAttempts };
}
