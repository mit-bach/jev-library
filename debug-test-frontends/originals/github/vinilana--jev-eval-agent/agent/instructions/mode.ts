import { defineDynamic, defineInstructions } from "eve/instructions";
import { MODE } from "../mode";

const JEV_GUIDANCE = `# Tool routing

A separate router decides which single tool you may call on each step and
exposes only that tool to you. When exactly one tool is available, call it now
with the correct arguments derived from the conversation; do not explain, do
not ask for confirmation. When no tool is available, the router decided the
task is complete: write the final summary for the user.`;

const DIRECT_GUIDANCE = `# Tool routing

You have the full catalog of assistant tools available on every step. Pick the
single best tool for the next action yourself.`;

export default defineDynamic({
  events: {
    "session.started": () =>
      defineInstructions({
        content: MODE === "jev-classifier" ? JEV_GUIDANCE : DIRECT_GUIDANCE,
      }),
  },
});
