import type { Group } from '@terrazzo/token-tools';
import eq from 'fast-deep-equal';
import type Logger from 'logger.js';
import { merge } from 'merge-anything';
import type { ResolverNormalized } from '../types.js';

export * from './validate.js';

export interface CreateResolverOptions {
  logger: Logger;
}

/**
 *
 */
export function createResolver(resolver: ResolverNormalized, { logger }: CreateResolverOptions) {
  const inputDefaults: Record<string, string> = {};
  const modifierPermutations: [string, string[]][] = []; // figure out modifiers
  for (const [name, m] of Object.entries(resolver.modifiers ?? {})) {
    if (typeof m.default === 'string') {
      inputDefaults[name] = m.default;
    }
    modifierPermutations.push([name, Object.keys(m.contexts)]);
  }
  for (const m of resolver.resolutionOrder) {
    if (!('type' in m) || m.type !== 'modifier') {
      continue;
    }
    if (typeof m.default === 'string') {
      inputDefaults[m.name] = m.default;
    }
    modifierPermutations.push([m.name, Object.keys(m.contexts)]);
  }

  const inputPermutations = calculatePermutations(modifierPermutations);

  return {
    apply(inputRaw?: Record<string, string>): Group {
      let tokens: Group = {};
      const input = { ...inputDefaults, ...inputRaw };
      for (const item of resolver.resolutionOrder) {
        switch (item.type) {
          case 'set': {
            for (const s of item.sources) {
              tokens = merge(tokens, s);
            }
            break;
          }
          case 'modifier': {
            const context = input[item.name]!;
            const sources = item.contexts[context];
            if (!sources) {
              logger.error({
                group: 'parser',
                label: 'resolver',
                message: `Modifier ${item.name} has no context ${JSON.stringify(context)}.`,
              });
            }
            for (const s of sources ?? []) {
              tokens = merge(tokens, s);
            }
            break;
          }
        }
      }
      return tokens;
    },
    inputPermutations,
    isValidInput(inputRaw: Record<string, string>) {
      if (!inputRaw || typeof inputRaw !== 'object') {
        logger.error({ group: 'parser', label: 'resolver', message: `Invalid input: ${JSON.stringify(inputRaw)}.` });
      }
      const input = { ...inputDefaults, ...inputRaw };
      return inputPermutations.findIndex((p) => eq(input, p)) !== -1;
    },
  };
}

/** Calculate all permutations */
export function calculatePermutations(options: [string, string[]][]) {
  const permutationCount = [1];
  for (const [_name, contexts] of options) {
    permutationCount.push(contexts.length * (permutationCount.at(-1) || 1));
  }
  const permutations: Record<string, string>[] = [];
  for (let i = 0; i < permutationCount.at(-1)!; i++) {
    const input: Record<string, string> = {};
    for (let j = 0; j < options.length; j++) {
      const [name, contexts] = options[j]!;
      input[name] = contexts[Math.floor(i / permutationCount[j]!) % contexts.length]!;
    }
    permutations.push(input);
  }
  return permutations.length ? permutations : [{}];
}
