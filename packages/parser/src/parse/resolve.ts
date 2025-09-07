import { isAlias, parseAlias, type TokenNormalizedSet } from '@terrazzo/token-tools';

let fs: any;

/**
 * Resolve a URL and return its unparsed content in Node.js or browser environments safely.
 * Note: response could be JSON or YAML (tip: pair with maybeRawJSON helper)
 */
export async function resolveRaw(path: URL, init?: RequestInit): Promise<string> {
  // load node:fs if we‘re trying to load files. throw error if we try and open files from a browser context.
  if (path.protocol === 'file:') {
    if (!fs) {
      try {
        fs = await import('node:fs/promises').then((m) => m.default);
      } catch {
        throw new Error(`Tried to load file ${path.href} outside a Node.js environment`);
      }
    }
    return await fs.readFile(path, 'utf8');
  }

  const res = await fetch(path, { redirect: 'follow', ...init });
  if (!res.ok) {
    throw new Error(`${path.href} responded with ${res.status}:\n${res.text()}`);
  }
  return res.text();
}

/** Detect circular aliases */
export function detectCircularAliases(tokens: TokenNormalizedSet, jsonID: string, path = [] as string[]): void {
  for (const mode of Object.keys(tokens[jsonID]!.mode)) {
    if (!isAlias((tokens[jsonID]!.mode[mode] as any).$value)) {
      continue;
    }
    const nextID = parseAlias((tokens[jsonID]!.mode[mode] as any).$value);
    if (path.includes(nextID)) {
      throw new Error();
    }
    path.push(nextID);
    detectCircularAliases(tokens, nextID, path);
  }
}
