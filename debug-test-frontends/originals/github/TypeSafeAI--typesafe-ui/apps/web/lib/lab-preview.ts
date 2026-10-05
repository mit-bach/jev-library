import type { JevAnswer } from "@workspace/ui/components/jev-result"
import type { LabEntry } from "@/lib/lab-registry"

export function stateText(state: unknown) {
  return typeof state === "string" ? state : JSON.stringify(state, null, 2)
}
export function parseLabState(text: string, structured: boolean): unknown {
  if (!text.trim()) throw new Error("Add input before running the preview.")
  if (text.length > 100_000)
    throw new Error("Keep the input below 100,000 characters.")
  if (!structured) return text
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new Error("Fix the JSON input before running the preview.")
  }
  if (value === null || typeof value !== "object")
    throw new Error("Use a JSON object or array for this example.")
  return value
}
export function comparisonState(
  state: unknown,
  comparison: NonNullable<LabEntry["comparison"]>
): unknown {
  const result: unknown = structuredClone(state)
  let target = result
  for (const [index, key] of comparison.path.entries()) {
    if (
      target === null ||
      typeof target !== "object" ||
      !Object.hasOwn(target, key) ||
      ["__proto__", "prototype", "constructor"].includes(key)
    )
      throw new Error(
        `The comparison field ${comparison.path.join(".")} is missing. Restore the input or add that field.`
      )
    if (index === comparison.path.length - 1)
      (target as Record<string, unknown>)[key] = comparison.value
    else target = (target as Record<string, unknown>)[key]
  }
  return result
}
export function requestFor(entry: LabEntry, state: unknown) {
  return {
    model: "jev-latest",
    state,
    questions: Object.fromEntries(
      entry.questions.map(({ id, type, instructions, criteria }) => [
        id,
        { type, instructions, ...(criteria ? { criteria } : {}) },
      ])
    ),
  }
}
export function fixtureAnswers(
  entry: LabEntry,
  values: Record<string, string>
): JevAnswer[] {
  return entry.questions.map((q) => {
    const raw =
      values[q.id] ??
      (q.type === "choice" ? (Object.keys(q.criteria ?? {})[0] ?? "") : "0.5")
    if (raw === "__unknown")
      return { id: q.id, label: q.label, type: q.type, value: null }
    if (q.type === "choice") {
      if (!Object.hasOwn(q.criteria ?? {}, raw))
        throw Error(`Choose an allowed value for ${q.label}.`)
      return { id: q.id, label: q.label, type: q.type, value: raw }
    }
    const value = Number(raw)
    if (!Number.isFinite(value) || value < 0 || value > 1)
      throw Error(`${q.label} must be between 0 and 1.`)
    return { id: q.id, label: q.label, type: q.type, value }
  })
}
