const MAX_EXPLICIT_VALUES = 20;

export function inputValues(task: string, explicit: string[] = []): string[] {
  const quoted = [...task.matchAll(/"([^"\n]+)"|“([^”\n]+)”/g)]
    .map((match) => match[1] ?? match[2])
    .filter((value): value is string => value !== undefined);
  const values = [...new Set([...explicit, ...quoted])];
  if (values.length > MAX_EXPLICIT_VALUES) {
    throw new Error(`Use no máximo ${MAX_EXPLICIT_VALUES} valores de preenchimento.`);
  }
  return values;
}
