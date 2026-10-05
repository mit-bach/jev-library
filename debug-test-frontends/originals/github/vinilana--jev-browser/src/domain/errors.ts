export function errorMessage(error: unknown, maxLength?: number): string {
  const message = error instanceof Error ? error.message : String(error);
  return maxLength === undefined ? message : message.slice(0, maxLength);
}
