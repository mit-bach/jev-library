/**
 * Model presets, all served through OpenRouter. Select one with EVAL_MODEL=<key>
 * (or pass a raw OpenRouter id with OPENROUTER_MODEL=...).
 *
 * `reasoning` describes what the OpenRouter endpoint accepts (from
 * GET /api/v1/models on 2026-09-17). Per branch:
 *  - direct: the model chooses among 100 tools with its default/medium effort.
 *  - jev:    Jev chooses the tool; the model runs with the lowest effort it
 *            accepts (`disable: true` sends reasoning.enabled=false when the
 *            endpoint allows turning reasoning off).
 * `pricing` is USD per 1M tokens (prompt, completion) and is only used to
 * estimate cost in the eval report.
 */
export interface ModelPreset {
  readonly key: string;
  readonly label: string;
  readonly id: string;
  readonly contextWindow: number;
  readonly direct: { effort?: string };
  readonly jev: { effort?: string; disable?: boolean };
  readonly pricing: { input: number; output: number };
  /** Extra OpenRouter provider-routing options (e.g. pin an upstream). */
  readonly routing?: { only?: string[]; order?: string[]; allow_fallbacks?: boolean };
}

export const MODEL_PRESETS: readonly ModelPreset[] = [
  {
    key: "gemini-3.8-flash",
    label: "Gemini 3.8 Flash",
    id: "google/gemini-3.8-flash",
    contextWindow: 1_048_576,
    // reasoning is mandatory; efforts low|medium|high
    direct: { effort: "medium" },
    jev: { effort: "low" },
    pricing: { input: 0.75, output: 3.75 },
    // Gemini 3 thought signatures only validate on the upstream that produced
    // them; OpenRouter serves this model from AI Studio and Vertex.
    routing: { only: ["google-ai-studio"], allow_fallbacks: false },
  },
  {
    key: "deepseek-v4.1-flash",
    label: "DeepSeek V4.1 Flash",
    id: "deepseek/deepseek-v4.1-flash",
    contextWindow: 1_048_576,
    // efforts low|high|max, default high, can be disabled
    direct: { effort: "high" },
    jev: { disable: true },
    pricing: { input: 0.3, output: 1.2 },
  },
  {
    key: "gpt-5.6-luna",
    label: "GPT-5.6 Luna",
    id: "openai/gpt-5.6-luna",
    contextWindow: 1_050_000,
    // efforts none|low|medium|high|xhigh|max
    direct: { effort: "medium" },
    jev: { effort: "none" },
    pricing: { input: 0.2, output: 1.2 },
  },
  {
    key: "gpt-5.6-sol",
    label: "GPT-5.6 Sol",
    id: "openai/gpt-5.6-sol",
    contextWindow: 1_050_000,
    direct: { effort: "medium" },
    jev: { effort: "none" },
    pricing: { input: 2, output: 10 },
  },
  {
    key: "opus-5",
    label: "Claude Opus 5",
    id: "anthropic/claude-opus-5",
    contextWindow: 1_000_000,
    // efforts low|medium|high|xhigh|max, can be disabled
    direct: { effort: "medium" },
    jev: { disable: true },
    pricing: { input: 5, output: 25 },
  },
  {
    key: "fable-5.1",
    label: "Claude Fable 5.1",
    id: "anthropic/claude-fable-5.1",
    contextWindow: 1_000_000,
    // reasoning is mandatory; efforts low|medium|high|xhigh|max (default high)
    direct: { effort: "medium" },
    jev: { effort: "low" },
    pricing: { input: 10, output: 50 },
  },
  {
    key: "gpt-6-astra",
    label: "GPT-6 Astra",
    id: "openai/gpt-6-astra",
    contextWindow: 1_050_000,
    // reasoning is mandatory; efforts low|medium|high|xhigh|max (default medium)
    direct: { effort: "medium" },
    jev: { effort: "low" },
    pricing: { input: 10, output: 50 },
  },
  {
    key: "qwen3.8-27b",
    label: "Qwen 3.8 27B",
    id: "qwen/qwen3.8-27b",
    contextWindow: 1_000_000,
    // efforts low|medium|xhigh (default xhigh), can be disabled
    direct: { effort: "medium" },
    jev: { disable: true },
    pricing: { input: 0.214, output: 2.55 },
  },
];

export const DEFAULT_MODEL_KEY = "gemini-3.8-flash";

export function resolvePreset(): ModelPreset {
  const raw = process.env.OPENROUTER_MODEL;
  const key = process.env.EVAL_MODEL ?? (raw ? undefined : DEFAULT_MODEL_KEY);
  if (key) {
    const preset = MODEL_PRESETS.find((p) => p.key === key || p.id === key);
    if (!preset) {
      throw new Error(`Unknown EVAL_MODEL "${key}". Known: ${MODEL_PRESETS.map((p) => p.key).join(", ")}`);
    }
    return preset;
  }
  // OPENROUTER_MODEL that happens to be a known preset id → use the preset.
  const byId = MODEL_PRESETS.find((p) => p.id === raw);
  if (byId) return byId;
  // Raw OpenRouter id: no pricing/effort knowledge, use conservative defaults.
  return {
    key: raw!.replace(/[^a-z0-9.-]+/gi, "-"),
    label: raw!,
    id: raw!,
    contextWindow: Number(process.env.OPENROUTER_CONTEXT_WINDOW ?? 200_000),
    direct: {},
    jev: { effort: "low" },
    pricing: { input: 0, output: 0 },
  };
}

/** Directory-safe key of the active preset, shared by agent and evals. */
export function activeModelKey(): string {
  return resolvePreset().key;
}
