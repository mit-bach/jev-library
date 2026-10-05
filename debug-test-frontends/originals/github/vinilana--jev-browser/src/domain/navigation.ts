import type { Observation } from './types.js';

/** Only standalone URL-opening commands qualify; compound tasks still need Jev. */
export function navigationSatisfied(task: string, observation: Observation): boolean {
  const match =
    /^(?:abra|acesse|visite|open|visit|go to|navigate to|navegue (?:até|para))\s+(https?:\/\/[^\s]+)\s*$/i.exec(
      task.trim(),
    );
  if (!match?.[1] || (!observation.text.trim() && observation.elements.length === 0)) return false;
  try {
    const expected = new URL(match[1]);
    const actual = new URL(observation.url);
    if (
      ![expected, actual].every(
        (url) => ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password,
      )
    )
      return false;
    // Accept the common www redirect, but never arbitrary subdomains or paths.
    const host = (url: URL) => url.hostname.replace(/^www\./, '');
    return (
      host(expected) === host(actual) &&
      expected.port === actual.port &&
      (expected.protocol === actual.protocol ||
        (expected.protocol === 'http:' && actual.protocol === 'https:')) &&
      expected.pathname === actual.pathname &&
      expected.search === actual.search &&
      expected.hash === actual.hash
    );
  } catch {
    return false;
  }
}
