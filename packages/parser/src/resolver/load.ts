import type * as momoa from '@humanwhocodes/momoa';
import { type InputSource, type InputSourceWithDocument, maybeRawJSON, parseRef } from '@terrazzo/json-schema-tools';
import type { TokenNormalizedSet } from '@terrazzo/token-tools';
import type yamlToMomoa from 'yaml-to-momoa';
import { toMomoa } from '../lib/momoa.js';
import { destructiveMerge, getPermutationID } from '../lib/resolver-utils.js';
import type Logger from '../logger.js';
import { processTokens } from '../parse/process.js';
import { aliasToGroupRef } from '../parse/token.js';
import type {
  ConfigInit,
  Resolver,
  ResolverInput,
  ResolverModifierNormalized,
  ResolverSourceNormalized,
} from '../types.js';
import { normalizeResolver } from './normalize.js';
import { isLikelyResolver, validateResolver } from './validate.js';

export interface LoadResolverOptions {
  config: ConfigInit;
  logger: Logger;
  req: (url: URL, origin: URL) => Promise<string>;
  yamlToMomoa?: typeof yamlToMomoa;
}

/** Quick-parse input sources and find a resolver */
export async function loadResolver(
  inputs: InputSource[],
  { config, logger, req, yamlToMomoa }: LoadResolverOptions,
): Promise<{ resolver: Resolver | undefined; tokens: TokenNormalizedSet; sources: InputSourceWithDocument[] }> {
  let resolverDoc: momoa.DocumentNode | undefined;
  let tokens: TokenNormalizedSet = {};
  const entry = {
    group: 'parser',
    label: 'init',
  } as const;

  for (const input of inputs) {
    let document: momoa.DocumentNode | undefined;
    if (typeof input.src === 'string') {
      if (maybeRawJSON(input.src)) {
        document = toMomoa(input.src);
      } else if (yamlToMomoa) {
        document = yamlToMomoa(input.src);
      } else {
        logger.error({
          ...entry,
          message: `Install yaml-to-momoa package to parse YAML, and pass in as option, e.g.:

  import { bundle } from '@terrazzo/json-schema-tools';
  import yamlToMomoa from 'yaml-to-momoa';

  bundle(yamlString, { yamlToMomoa });`,
        });
      }
    } else if (input.src && typeof input.src === 'object') {
      document = toMomoa(JSON.stringify(input.src, undefined, 2));
    } else {
      logger.error({ ...entry, message: `Could not parse ${input.filename}. Is this valid JSON or YAML?` });
    }
    if (!document || !isLikelyResolver(document)) {
      continue;
    }
    if (inputs.length > 1) {
      logger.error({ ...entry, message: `Resolver must be the only input, found ${inputs.length} sources.` });
    }
    resolverDoc = document;
    break;
  }

  let resolver: Resolver | undefined;
  if (resolverDoc) {
    validateResolver(resolverDoc, { logger, src: inputs[0]!.src });
    const normalized = await normalizeResolver(resolverDoc, {
      filename: inputs[0]!.filename!,
      logger,
      req,
      src: inputs[0]!.src,
      yamlToMomoa,
    });
    resolver = createResolver(normalized, { config, logger, sources: [{ ...inputs[0]!, document: resolverDoc }] });

    // If a resolver is present, load a single permutation to get a base token set.
    const firstInput: ResolverInput = {};
    for (const m of resolver.source.resolutionOrder) {
      if (m.type !== 'modifier') {
        continue;
      }
      firstInput[m.name] = typeof m.default === 'string' ? m.default : Object.keys(m.contexts)[0]!;
    }
    tokens = resolver.apply(firstInput);
  }

  return {
    resolver,
    tokens,
    sources: [{ ...inputs[0]!, document: resolverDoc! }],
  };
}

export interface CreateResolverOptions {
  config: ConfigInit;
  logger: Logger;
  sources: InputSourceWithDocument[];
}

/** Create an interface to resolve permutations */
export function createResolver(
  resolverSource: ResolverSourceNormalized,
  { config, logger, sources }: CreateResolverOptions,
): Resolver {
  const inputDefaults: ResolverInput = {};
  const validContexts: Record<string, string[]> = {};
  const allPermutations: ResolverInput[] = [];
  const modifiers: ResolverModifierNormalized[] = [];

  const resolverCache: Record<string, any> = {};

  // Important: by iterating over resolutionOrder, we
  // filter out unused modifiers/irrelevant contexts.
  for (const m of resolverSource.resolutionOrder) {
    if (m.type === 'modifier') {
      if (typeof m.default === 'string') {
        inputDefaults[m.name] = m.default!;
      }
      validContexts[m.name] = Object.keys(m.contexts);
      modifiers.push(m);
    }
  }

  const permutationCount = Object.values(validContexts).reduce((acc, context) => acc * context.length, 1);
  const defaultTokenSource = getDefaultTokenSource(resolverSource, inputDefaults);
  const modifierTokenIDs = new Map(
    modifiers.map((modifier) => [modifier.name, collectModifierTokenIDs(modifier, defaultTokenSource)]),
  );
  const orthogonal = areModifierTokenIDsOrthogonal(modifierTokenIDs);

  return {
    orthogonal,
    apply(inputRaw, options) {
      const tokensRaw: TokenNormalizedSet = {};
      const input = { ...inputDefaults, ...inputRaw };
      const permutationID = getPermutationID(input, options);

      if (resolverCache[permutationID]) {
        return resolverCache[permutationID];
      }

      for (const item of resolverSource.resolutionOrder) {
        switch (item.type) {
          case 'set': {
            if (options?.sets && !options.sets.includes(item.name)) {
              continue;
            }
            for (const s of item.sources) {
              destructiveMerge(tokensRaw, s);
            }
            break;
          }
          case 'modifier': {
            if (options?.modifiers && !options.modifiers.includes(item.name)) {
              continue;
            }
            const context = input[item.name]!;
            const sources = item.contexts[context];
            if (!sources) {
              logger.error({
                group: 'resolver',
                message: `Modifier ${item.name} has no context ${JSON.stringify(context)}.`,
              });
            }
            for (const s of sources ?? []) {
              destructiveMerge(tokensRaw, s);
            }
            break;
          }
        }
      }

      const src = JSON.stringify(tokensRaw, undefined, 2);
      const rootSource = { filename: resolverSource._source.filename!, document: toMomoa(src), src };
      const tokens = processTokens(rootSource, {
        config,
        logger,
        sourceByFilename: { [resolverSource._source.filename!.href]: rootSource },
        isResolver: true,
        sources,
      });
      resolverCache[permutationID] = tokens;
      return tokens;
    },
    source: resolverSource,
    listPermutations:
      permutationCount <= config.permutationLimit
        ? () => {
            // only do work on first call, then cache subsequent work. this could be thousands of possible values!
            if (!allPermutations.length) {
              allPermutations.push(...calculatePermutations(Object.entries(validContexts)));
            }
            return allPermutations;
          }
        : undefined,
    isValidInput(input, throwError = false) {
      if (!input || typeof input !== 'object') {
        logger.error({ group: 'resolver', message: `Invalid input: ${JSON.stringify(input)}.` });
      }
      for (const k of Object.keys(input)) {
        if (!(k in validContexts)) {
          if (throwError) {
            logger.error({ group: 'resolver', message: `No such modifier ${JSON.stringify(k)}` });
          }
          return false; // 1. invalid if unknown modifier name
        }
      }
      for (const [name, contexts] of Object.entries(validContexts)) {
        // Note: empty strings are valid! Don’t check for truthiness.
        if (name in input) {
          if (name === 'tzMode') {
            continue; // reserved modifier
          }
          if (!contexts.includes(input[name]!)) {
            if (throwError) {
              logger.error({
                group: 'resolver',
                message: `Modifier "${name}" has no context ${JSON.stringify(input[name])}.`,
              });
            }
            return false; // 2. invalid if unknown context
          }
        } else if (!(name in inputDefaults)) {
          if (throwError) {
            logger.error({
              group: 'resolver',
              message: `Modifier "${name}" missing value (no default set).`,
            });
          }
          return false; // 3. invalid if omitted, and no default
        }
      }
      return true;
    },
    getPermutationID(input) {
      this.isValidInput(input, true);
      return getPermutationID({ ...inputDefaults, ...input });
    },
  };
}

function getDefaultTokenSource(
  resolverSource: ResolverSourceNormalized,
  inputDefaults: ResolverInput,
): Record<string, unknown> {
  const tokensRaw: Record<string, unknown> = {};
  for (const item of resolverSource.resolutionOrder) {
    switch (item.type) {
      case 'set': {
        for (const source of item.sources) {
          destructiveMerge(tokensRaw, source);
        }
        break;
      }
      case 'modifier': {
        const context = inputDefaults[item.name] ?? Object.keys(item.contexts)[0]!;
        for (const source of item.contexts[context] ?? []) {
          destructiveMerge(tokensRaw, source);
        }
        break;
      }
    }
  }
  return tokensRaw;
}

function collectModifierTokenIDs(
  modifier: ResolverModifierNormalized,
  defaultTokenSource: Record<string, unknown>,
): Set<string> {
  const tokenIDs = new Set<string>();
  for (const sources of Object.values(modifier.contexts)) {
    const contextSource: Record<string, unknown> = {};
    destructiveMerge(contextSource, defaultTokenSource);
    for (const source of sources) {
      destructiveMerge(contextSource, source);
      collectTokenIDs(source, [], tokenIDs, contextSource);
    }
  }
  return tokenIDs;
}

function collectTokenIDs(
  source: unknown,
  path: string[],
  tokenIDs: Set<string>,
  extendsSource: Record<string, unknown>,
  extendsChain = new Set<string>(),
): void {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return;
  }
  const sourceRecord = source as Record<string, unknown>;
  if (typeof sourceRecord.$extends === 'string') {
    const extended = resolveExtendedSource(sourceRecord.$extends, extendsSource);
    if (extended && !extendsChain.has(sourceRecord.$extends)) {
      extendsChain.add(sourceRecord.$extends);
      collectTokenIDs(extended, path, tokenIDs, extendsSource, extendsChain);
      extendsChain.delete(sourceRecord.$extends);
    }
  }
  if (Object.hasOwn(source, '$value')) {
    tokenIDs.add(path.join('.'));
    return;
  }
  for (const [key, value] of Object.entries(source)) {
    if (key.startsWith('$')) {
      continue;
    }
    collectTokenIDs(value, [...path, key], tokenIDs, extendsSource, extendsChain);
  }
}

function resolveExtendedSource($extends: string, source: Record<string, unknown>): unknown {
  const ref = aliasToGroupRef($extends);
  if (!ref) {
    return;
  }
  return getPath(source, parseRef(ref.$ref).subpath ?? []);
}

function getPath(source: unknown, path: string[]): unknown {
  let current = source;
  for (const part of path) {
    if (!current || typeof current !== 'object' || Array.isArray(current) || !Object.hasOwn(current, part)) {
      return;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function areModifierTokenIDsOrthogonal(modifierTokenIDs: Map<string, Set<string>>): boolean {
  const seenTokenIDs = new Set<string>();
  for (const tokenIDs of modifierTokenIDs.values()) {
    for (const tokenID of tokenIDs) {
      if (seenTokenIDs.has(tokenID)) {
        return false;
      }
      seenTokenIDs.add(tokenID);
    }
  }
  return true;
}

/** Calculate all permutations */
export function calculatePermutations(options: [string, string[]][]) {
  const permutationCount = [1];
  for (const [_name, contexts] of options) {
    permutationCount.push(contexts.length * (permutationCount.at(-1) || 1));
  }
  const permutations: Record<string, string>[] = [];
  for (let i = 0; i < permutationCount.at(-1)!; i++) {
    const input: ResolverInput = {};
    for (let j = 0; j < options.length; j++) {
      const [name, contexts] = options[j]!;
      input[name] = contexts[Math.floor(i / permutationCount[j]!) % contexts.length]!;
    }
    permutations.push(input);
  }
  return permutations.length ? permutations : [{}];
}
