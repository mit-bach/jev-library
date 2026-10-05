import { getSpec } from "./catalog";

/** Execute a catalog tool by name against the mock world. */
export async function runTool(name: string, input: unknown): Promise<unknown> {
  const spec = getSpec(name);
  const parsed = spec.inputSchema.parse(input ?? {});
  return spec.run(parsed);
}
