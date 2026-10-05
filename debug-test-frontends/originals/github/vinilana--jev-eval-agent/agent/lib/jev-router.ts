import { TypeSafeClient, choice, noul, type ChoiceCriteria, type EntryType } from "@typesafe-ai/sdk";
import type { ModelMessage } from "ai";
import { TOOL_SPECS } from "./catalog";
import { PLANS } from "./mock-model";

/** Pseudo-tool meaning "no tool: answer the user now". */
export const RESPOND = "respond_to_user";

export interface RouterDecision {
  readonly tool: string;
  readonly confidence: number;
  /** Probability (0-1) that every requested action is already done. */
  readonly done: number;
  /** True when the gate overrode a premature respond_to_user. */
  readonly gated: boolean;
  readonly top: readonly { name: string; p: number }[];
  readonly latencyMs: number;
  readonly state: RouterState;
}

export interface RouterState {
  readonly user_request: string;
  readonly actions_taken: readonly { step: number; tool: string; input: unknown; result: string }[];
  readonly assistant_said: readonly string[];
}

let client: TypeSafeClient | undefined;
function getClient(): TypeSafeClient {
  if (!client) {
    if (!process.env.TYPESAFE_API_KEY) {
      throw new Error("TYPESAFE_API_KEY is not set (required by the jev-classifier branch).");
    }
    client = new TypeSafeClient({ apiKey: process.env.TYPESAFE_API_KEY });
  }
  return client;
}

const CRITERIA: ChoiceCriteria = {
  [RESPOND]: {
    what: "No tool call is needed now: every part of the request has been carried out (results are already in actions_taken) or nothing in the catalog applies. The assistant should write its final answer.",
    not_for: "Cases where a step of the request (a lookup, a send, a booking, a creation) has not happened yet.",
  },
  ...Object.fromEntries(TOOL_SPECS.map((s) => [s.name, `${s.description} (category: ${s.category})`])),
};

const INSTRUCTIONS =
  "You are routing a personal-assistant agent. Given the user's request and the actions already taken (with their results), " +
  "which tool should the assistant call NEXT to make progress? Choose exactly one. " +
  "Follow the order implied by the request: look things up before acting on them, and honour conditions ('if…'). " +
  "Never repeat an action that already succeeded. If everything requested is done, choose respond_to_user.";

function textOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((p) => (p && typeof p === "object" && "type" in p && (p as { type: string }).type === "text" ? (p as { text: string }).text : ""))
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

function clip(value: unknown, max = 600): string {
  const s = typeof value === "string" ? value : JSON.stringify(value);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

/** Turn the AI SDK message history into a compact, JSON state for Jev. */
export function buildState(messages: readonly ModelMessage[]): RouterState {
  const userTexts: string[] = [];
  const assistantSaid: string[] = [];
  const actions: { step: number; tool: string; input: unknown; result: string }[] = [];
  const pending = new Map<string, { step: number; tool: string; input: unknown }>();
  let step = 0;

  for (const m of messages) {
    if (m.role === "user") {
      const t = textOf(m.content);
      if (t) userTexts.push(t);
    } else if (m.role === "assistant") {
      const t = textOf(m.content);
      if (t) assistantSaid.push(clip(t, 300));
      if (Array.isArray(m.content)) {
        for (const part of m.content) {
          if (part.type === "tool-call") {
            step += 1;
            pending.set(part.toolCallId, { step, tool: part.toolName, input: part.input });
          }
        }
      }
    } else if (m.role === "tool") {
      for (const part of m.content) {
        if (part.type === "tool-result") {
          const call = pending.get(part.toolCallId) ?? { step: ++step, tool: part.toolName, input: undefined };
          const out = part.output as { type?: string; value?: unknown } | undefined;
          const value = out && typeof out === "object" && "value" in out ? out.value : out;
          actions.push({ ...call, result: clip(value) });
        }
      }
    }
  }

  return {
    user_request: userTexts.join("\n---\n"),
    actions_taken: actions,
    assistant_said: assistantSaid,
  };
}

/**
 * Offline stand-in for Jev (`JEV_STUB=1`): walks the scripted plan in order.
 * Only for smoke-testing the step-scoped routing plumbing without an API key.
 */
function stubDecision(state: RouterState): RouterDecision {
  const plan = PLANS.find((p) => p.match.test(state.user_request));
  const done = new Set(state.actions_taken.map((a) => a.tool));
  const next = plan?.calls.find((c) => !done.has(c.name));
  const tool = next?.name ?? RESPOND;
  return { tool, confidence: 0.99, done: tool === RESPOND ? 1 : 0, gated: false, top: [{ name: tool, p: 0.99 }], latencyMs: 0, state };
}

const DONE_INSTRUCTIONS =
  "Every single action the user asked for (each lookup, send, booking, creation, reminder, transfer, message…) already appears as a successful entry in actions_taken. " +
  "False if at least one requested action has not been carried out yet, or a needed lookup returned nothing useful.";

/** Jev may answer respond_to_user while work remains; require agreement from the done-noul. */
const DONE_THRESHOLD = Number(process.env.JEV_DONE_THRESHOLD ?? 0.5);

/** Ask Jev which tool to call next. */
export async function chooseNextTool(messages: readonly ModelMessage[]): Promise<RouterDecision> {
  const state = buildState(messages);
  if (process.env.JEV_STUB === "1") return stubDecision(state);
  const started = performance.now();
  const { answers } = await getClient().systemOne({
    state: JSON.parse(JSON.stringify(state)) as EntryType,
    questions: {
      next_tool: choice(INSTRUCTIONS, CRITERIA),
      done: noul(DONE_INSTRUCTIONS),
    },
  });
  const latencyMs = Math.round(performance.now() - started);
  const answer = answers.next_tool;
  const done = answers.done.noul;
  const ranked = Object.entries(answer.probabilities as Record<string, number>).sort((a, b) => b[1] - a[1]);
  const top = ranked.slice(0, 5).map(([name, p]) => ({ name, p: Math.round(p * 1000) / 1000 }));
  let tool = answer.choice;
  let gated = false;
  if (tool === RESPOND && done < DONE_THRESHOLD) {
    const next = ranked.find(([name]) => name !== RESPOND);
    if (next) { tool = next[0]; gated = true; }
  }
  return { tool, confidence: answer.confidence, done, gated, top, latencyMs, state };
}
