/**
 * The experiment's single knob, read from the environment:
 *
 *   AGENT_MODE=llm-direct      (default) all 100 tools are exposed to the LLM on
 *                              every step and the model (reasoning on) picks.
 *   AGENT_MODE=jev-classifier  before every model step, TypeSafe Jev (a System-One
 *                              classifier, no text generation) picks the single
 *                              tool to call. The LLM runs with the lowest reasoning
 *                              it accepts and only fills in the arguments.
 *
 * eve evaluates this module both at compile time and at runtime inside the same
 * process, so the value is stable for one `eve dev` / `eve eval` run.
 */
export type AgentMode = "llm-direct" | "jev-classifier";

const raw = process.env.AGENT_MODE ?? "llm-direct";
if (raw !== "llm-direct" && raw !== "jev-classifier") {
  throw new Error(`AGENT_MODE must be "llm-direct" or "jev-classifier" (got "${raw}")`);
}
export const MODE: AgentMode = raw;
