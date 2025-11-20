import * as momoa from '@humanwhocodes/momoa';
import type Logger from '../logger.js';
import type { Group, Resolver, TokenNormalized, TokenNormalizedSet } from '../types.js';
import { createResolver } from './load.js';
import { normalizeResolver } from './normalize.js';

/**
 * Interop layer upgrading legacy Terrazzo modes to resolvers
 */
export async function createSyntheticResolver(
  tokens: TokenNormalizedSet,
  { logger, req }: { logger: Logger; req: (url: URL, origin: URL) => Promise<string> },
): Promise<Resolver> {
  const contexts: Record<string, any[]> = {};
  for (const token of Object.values(tokens)) {
    for (const [mode, value] of Object.entries(token.mode)) {
      if (mode === '.') {
        continue;
      }
      if (!(mode in contexts)) {
        contexts[mode] = [{}];
      }
      addToken(contexts[mode]![0], { ...token, $value: value.$value }, { logger });
    }
  }

  const src = JSON.stringify(
    {
      name: 'Terrazzo',
      version: '2025.10',
      resolutionOrder: [{ $ref: '#/sets/allTokens' }, { $ref: '#/modifiers/tzMode' }],
      sets: {
        allTokens: { sources: [simpleFlatten(tokens, { logger })] },
      },
      modifiers: {
        tzMode: {
          description: 'Automatically built from $extensions.mode',
          contexts,
        },
      },
    },
    undefined,
    2,
  );
  const normalized = await normalizeResolver(momoa.parse(src), {
    filename: new URL('file:///virtual:resolver.json'),
    logger,
    req,
    src,
  });
  return createResolver(normalized, { logger });
}

/** Add a normalized token back into an arbitrary, hierarchial structure */
function addToken(structure: any, token: TokenNormalized, { logger }: { logger: Logger }): void {
  let node = structure;
  const parts = token.id.split('.');
  const localID = parts.pop()!;
  for (const part of parts) {
    if (!(part in node)) {
      node[part] = {};
    }
    node = node[part];
  }
  if (localID in node) {
    logger.error({ group: 'parser', label: 'resolver', message: `${localID} already exists!` });
  }
  node[localID] = { $type: token.$type, $value: token.$value };
}

/** Downconvert normalized tokens back into a simplified, hierarchial shape. This is extremely lossy, and only done to build a resolver. */
function simpleFlatten(tokens: TokenNormalizedSet, { logger }: { logger: Logger }): Group {
  const group: Group = {};
  for (const token of Object.values(tokens)) {
    addToken(group, token, { logger });
  }
  return group;
}
