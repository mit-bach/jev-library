import { defineDynamic, defineTool } from "eve/tools";
import { MODE } from "../mode";
import { TOOL_SPECS, getSpec } from "../lib/catalog";
import { runTool } from "../lib/run-tool";
import { RESPOND, chooseNextTool } from "../lib/jev-router";
import { trace } from "../lib/trace";

function toolFor(name: string) {
  const spec = getSpec(name);
  return defineTool({
    description: spec.description,
    inputSchema: spec.inputSchema,
    execute: (input) => runTool(name, input),
  });
}

function allTools() {
  return Object.fromEntries(TOOL_SPECS.map((s) => [s.name, toolFor(s.name)]));
}

/**
 * llm-direct     → every tool is registered once per session; the LLM chooses.
 * jev-classifier → before EVERY model call, Jev looks at the conversation and
 *                  picks one tool (or "respond_to_user"); only that tool is
 *                  exposed to Gemini for that step.
 */
export default defineDynamic({
  events:
    MODE === "jev-classifier"
      ? {
          "step.started": async (event, ctx) => {
            const stepIndex = (event as { data?: { stepIndex?: number } })?.data?.stepIndex;
            const decision = await chooseNextTool(ctx.messages);
            trace({
              kind: "jev.decision",
              sessionId: ctx.session.id,
              stepIndex,
              tool: decision.tool,
              confidence: decision.confidence,
              done: decision.done,
              gated: decision.gated,
              top: decision.top,
              latencyMs: decision.latencyMs,
              actionsSoFar: decision.state.actions_taken.length,
            });
            if (decision.tool === RESPOND) return null;
            return { [decision.tool]: toolFor(decision.tool) };
          },
        }
      : {
          "session.started": async () => allTools(),
        },
});
