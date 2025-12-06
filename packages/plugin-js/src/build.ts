import {
  calculatePermutations,
  type Logger,
  type Resolver,
  type ResolverModifierNormalized,
  type TokenNormalized,
} from '@terrazzo/parser';
import { FILE_HEADER } from './lib.js';

const RESOLVER_JSDOC_COMMENT = '/** Produce a token set from a given input. */';

export function buildJS({
  resolver,
  properties,
  logger,
  contexts,
}: {
  resolver: Resolver;
  properties: Set<keyof TokenNormalized>;
  contexts?: Record<string, string[]>;
  logger: Logger;
}): string {
  const entry = { group: 'plugin' as const, label: '@terrazzo/plugin-js' };

  // here, output not being an array drastically reduces memory usage for large token sets
  let output = FILE_HEADER;
  output += '\n';

  // 1. Permutations
  const permutations = (contexts ? calculatePermutations(Object.entries(contexts)) : resolver.listPermutations()).map(
    (value) => ({
      value,
      // Note: id MUST have modifiers sorted alphabetically, so we can index them shallowly
      id: JSON.stringify(
        Object.fromEntries(Object.entries(value).sort((a, b) => a[0].localeCompare(b[0], 'en-us', { numeric: true }))),
      ),
    }),
  );
  output += 'export const PERMUTATIONS = {\n';
  let permutationI = 1;
  for (const { value, id } of permutations) {
    const start = performance.now();
    try {
      const tokens = resolver.apply(value);
      output += `  ${JSON.stringify(id)}: {\n`;
      for (const id of Object.keys(tokens)) {
        output += `    ${serializeToken(tokens[id]!, properties)},\n`;
      }
      output += '  },\n';
    } catch (err) {
      logger.error({ ...entry, message: (err as Error).message });
    }
    const timing = performance.now() - start;
    logger.info({
      ...entry,
      message: `Permutation ${permutationI}/${permutations.length} done (${id})`,
      timing,
    });
    permutationI++;
  }
  output += '};\n';

  // 2. Input defaults
  const inputDefaults = Object.fromEntries(
    resolver.source.resolutionOrder
      .filter((i) => i.type === 'modifier' && 'default' in i)
      .map((m) => [m.name, (m as ResolverModifierNormalized).default!]),
  );
  output += `const INPUT_DEFAULTS = ${JSON.stringify(inputDefaults)};\n`;

  // 3. Resolver
  output += RESOLVER_JSDOC_COMMENT;
  output += '\n';
  output += `export const resolver = {
  apply(userInput) {
    if (!userInput || typeof userInput !== "object") {
      throw new Error(\`invalid input: \${userInput}\`);
    }
    const input = { ...INPUT_DEFAULTS, ...userInput };
    const inputKey = JSON.stringify(Object.fromEntries(Object.entries(input).sort((a, b) => a[0].localeCompare(b[0], "en-us", { numeric: true }))));
    return PERMUTATIONS[inputKey];
  },
  listPermutations() {
    return [${permutations.map((p) => p.id).join(', ')}];
  },
};\n`;

  return output;
}

export function buildDTS({ resolver, contexts }: { resolver: Resolver; contexts?: Record<string, string[]> }): string {
  let output = FILE_HEADER;
  output += '\n\n';
  output += 'import type { Resolver, TokenNormalizedSet } from "@terrazzo/parser";\n\n';
  output += 'export const PERMUTATIONS: Record<string, TokenNormalizedSet>;\n\n';
  output += `type InputType = ${buildInputType(resolver, contexts)};\n\n`;
  output += RESOLVER_JSDOC_COMMENT;
  output += '\n';
  output += 'export const resolver: Pick<Resolver<InputType>, "apply" | "listPermutations">;\n';
  return output;
}

/** Generate TypeScript definition of valid inputs given a resolver */
function buildInputType(resolver: Resolver, contexts?: Record<string, string[]>): string {
  const validContexts: Record<string, string[]> = contexts ?? {};
  if (!Object.keys(validContexts).length) {
    for (const [name, m] of Object.entries(resolver.source.modifiers ?? {})) {
      validContexts[name] = Object.keys(m.contexts);
    }
    for (const m of resolver.source.resolutionOrder) {
      if (m?.type !== 'modifier') {
        continue;
      }
      validContexts[m.name] = Object.keys(m.contexts);
    }
  }

  let output = '{';
  for (const [name, values] of Object.entries(validContexts)) {
    output += `\n  ${JSON.stringify(name)}: ${values.length ? values.map((v) => JSON.stringify(v)).join(' | ') : 'never'};`;
  }
  output += '\n};';
  return output;
}

/** Serialize normalized Tokens set into a string */
function serializeToken(token: TokenNormalized, includeProperties: Set<keyof TokenNormalized>): string {
  return `${JSON.stringify(token.id)}:${JSON.stringify(Object.fromEntries(Object.entries(token).filter(([k]) => includeProperties.has(k as keyof TokenNormalized))))}`;
}
