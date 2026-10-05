export const MAX_COMMANDS = 20;
const DOMAIN_OR_URL =
  /https?:\/\/[^\s"'<>]+|(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s"'<>]*)?/i;

export function parseCommandsJson(value: string): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('--commands precisa ser um array JSON válido de strings.');
  }
  if (!Array.isArray(parsed) || parsed.some((command) => typeof command !== 'string')) {
    throw new Error('--commands precisa ser um array JSON de strings.');
  }
  return validateCommands(parsed);
}

export function validateCommands(commands: string[]): string[] {
  const normalized = commands.map((command) => command.trim());
  if (normalized.length === 0) throw new Error('Informe pelo menos um comando.');
  if (normalized.length > MAX_COMMANDS) {
    throw new Error(`Use no máximo ${MAX_COMMANDS} comandos por execução.`);
  }
  if (normalized.some((command) => command.length === 0)) {
    throw new Error('Comandos vazios não são permitidos.');
  }
  return normalized;
}

export function inferInitialUrl(commands: string[]): string | undefined {
  for (const command of commands) {
    const match = DOMAIN_OR_URL.exec(command)?.[0]?.replace(/[),.;!?]+$/, '');
    if (!match) continue;
    const candidate =
      match.startsWith('http://') || match.startsWith('https://') ? match : `https://${match}`;
    try {
      const url = new URL(candidate);
      if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
    } catch {
      // Continue looking for another valid URL in later commands.
    }
  }
  return undefined;
}
