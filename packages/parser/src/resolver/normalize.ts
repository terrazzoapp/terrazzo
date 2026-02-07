import * as momoa from '@humanwhocodes/momoa';
import { bundle, encodeFragment, parseRef, replaceNode } from '@terrazzo/json-schema-tools';
import type yamlToMomoa from 'yaml-to-momoa';
import type Logger from '../logger.js';
import type {
  Group,
  ReferenceObject,
  ResolverModifierNormalized,
  ResolverSetNormalized,
  ResolverSourceNormalized,
} from '../types.js';

export interface NormalizeResolverOptions {
  logger: Logger;
  yamlToMomoa?: typeof yamlToMomoa;
  filename: URL;
  req: (url: URL, origin: URL) => Promise<string>;
  src?: any;
}

/** Normalize resolver (assuming it’s been validated) */
export async function normalizeResolver(
  document: momoa.DocumentNode,
  { logger, filename, req, src, yamlToMomoa }: NormalizeResolverOptions,
): Promise<ResolverSourceNormalized> {
  // Important note: think about sets, modifiers, and resolutionOrder all
  // containing their own partial tokens documents. Now think about JSON $refs
  // inside those. Because we want to treat them all as one _eventual_ document,
  // we defer resolving $refs until the very last step. In most setups, this has
  // no effect on the final result, however, in the scenario where remote
  // documents are loaded and they conflict in unexpected ways, resolving too
  // early will produce incorrect results.
  //
  // To prevent this, we bundle ONCE at the very top level, with the `$defs` at
  // the top level now containing all partial documents (as opposed to bundling
  // every sub document individually). So all that said, we are deciding to
  // choose the “all-in-one“ method for closer support with DTCG aliases, but at
  // the expense of some edge cases of $refs behaving unexpectedly.
  const resolverBundle = await bundle([{ filename, src }], { req, yamlToMomoa });
  const resolverSource = momoa.evaluate(resolverBundle.document) as unknown as ResolverSourceNormalized;

  // Resolve $refs, but in a very different way than everywhere else These are
  // all _evaluated_, meaning initialized in JS memory. Unlike in the AST, when
  // we resolve these they’ll share memory points (which isn’t possible in the
  // AST—values must be duplicated). This code is unique because it’s the only
  // place where we’re dealing with shared, initialized JS memory.
  replaceNode(document, resolverBundle.document); // inject $defs into the root document
  for (const set of Object.values(resolverSource.sets ?? {})) {
    for (const source of set.sources) {
      resolvePartials(source, { resolver: resolverSource, logger });
    }
  }
  for (const modifier of Object.values(resolverSource.modifiers ?? {})) {
    for (const context of Object.values(modifier.contexts)) {
      for (const source of context) {
        resolvePartials(source, { resolver: resolverSource, logger });
      }
    }
  }
  for (const item of resolverSource.resolutionOrder ?? []) {
    resolvePartials(item, { resolver: resolverSource, logger });
  }

  return {
    name: resolverSource.name,
    version: resolverSource.version,
    description: resolverSource.description,
    sets: resolverSource.sets,
    modifiers: resolverSource.modifiers,
    resolutionOrder: resolverSource.resolutionOrder,
    _source: {
      filename,
      document,
    },
  };
}

/** Resolve $refs for already-initialized JS */
function resolvePartials(
  source: Group | ReferenceObject | ResolverSetNormalized | ResolverModifierNormalized,
  {
    resolver,
    logger,
  }: {
    resolver: any;
    logger: Logger;
  },
) {
  if (!source) {
    return;
  }
  const entry = { group: 'parser' as const, label: 'resolver' };
  if (Array.isArray(source)) {
    for (const item of source) {
      resolvePartials(item, { resolver, logger });
    }
  } else if (typeof source === 'object') {
    for (const k of Object.keys(source)) {
      if (k === '$ref') {
        const $ref = (source as any)[k] as string;
        const { url, subpath = [] } = parseRef($ref);
        if (url !== '.' || !subpath.length) {
          logger.error({ ...entry, message: `Could not load $ref ${JSON.stringify($ref)}` });
        }
        const found = findObject(resolver, subpath ?? [], logger);
        if (subpath[0] === 'sets' || subpath[0] === 'modifiers') {
          found.type = subpath[0].replace(/s$/, '');
          found.name = subpath[1];
        }
        if (found) {
          for (const k2 of Object.keys(found)) {
            (source as any)[k2] = found[k2];
          }
          delete (source as any).$ref;
        } else {
          logger.error({ ...entry, message: `Could not find ${JSON.stringify($ref)}` });
        }
      } else {
        resolvePartials((source as any)[k], { resolver, logger });
      }
    }
  }
}

function findObject(dict: Record<string, any>, path: string[], logger: Logger): any {
  let node = dict;
  for (const idRaw of path) {
    const id = idRaw.replace(/~/g, '~0').replace(/\//g, '~1');
    if (!(id in node)) {
      logger.error({
        group: 'parser',
        label: 'resolver',
        message: `Could not load $ref ${encodeFragment(path)}`,
      });
    }
    node = node[id];
  }
  return node;
}
