import { defineAgent } from "eve";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { MODE } from "./mode";
import { buildMockModel } from "./lib/mock-model";
import { resolvePreset } from "./lib/models";

const isJev = MODE === "jev-classifier";
const preset = resolvePreset();

// Env overrides for quick experiments (must be an effort the endpoint accepts).
const directEffort = process.env.DIRECT_REASONING ?? preset.direct.effort;
const jevEffort = process.env.JEV_REASONING ?? preset.jev.effort;

function reasoningOptions(): Record<string, string | boolean> {
  if (isJev) {
    if (preset.jev.disable && !process.env.JEV_REASONING) return { enabled: false, exclude: true };
    return jevEffort ? { effort: jevEffort } : {};
  }
  return directEffort ? { effort: directEffort } : {};
}

function resolveModel() {
  if (process.env.AGENT_MODEL === "mock") return buildMockModel();
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
    // Cap the per-request output budget. Without it OpenRouter reserves the
    // model's full max (e.g. 65k tokens) against the key's remaining credit
    // and rejects the call with "requires more credits, or fewer max_tokens"
    // long before the credit actually runs out. Our steps need a few k at most.
    extraBody: { max_tokens: Number(process.env.OPENROUTER_MAX_TOKENS ?? 8192) },
    headers: {
      "HTTP-Referer": "https://github.com/local/jev-eval-agent",
      "X-Title": `jev-eval-agent (${MODE})`,
    },
  });
  return openrouter(preset.id);
}

const reasoning = reasoningOptions();

export default defineAgent({
  model: resolveModel(),
  // OpenRouter is a direct provider, so eve cannot look the window up in the
  // AI Gateway catalog.
  modelContextWindowTokens: preset.contextWindow,
  // Only our 100 assistant tools; no bash/read_file/todo/etc. so both branches
  // see exactly the same tool surface.
  defaultTools: false,
  modelOptions: {
    providerOptions: {
      openrouter: {
        ...(Object.keys(reasoning).length ? { reasoning } : {}),
        usage: { include: true },
        ...(preset.routing ? { provider: { ...preset.routing } } : {}),
      },
    },
  },
  limits: {
    maxOutputTokensPerSession: 80_000,
  },
});
