import stripAnsi from 'strip-ansi';
import { expect } from 'vitest';
import yamlToMomoa from 'yaml-to-momoa';

import { defineConfig, parse, type TokensJSONError } from '../src/index.js';

export const cwd = new URL(import.meta.url);
export const DEFAULT_FILENAME = new URL('file:///tokens.json');

export type Test = [
  string,
  {
    given: any;
    want:
      | {
          error?: never;
          tokens: Record<string, any>;
        }
      | { error: string; tokens?: never };
  },
];

export async function parserTest({ given, want }: Test[1]) {
  const config = defineConfig({}, { cwd });
  let result: Awaited<ReturnType<typeof parse>> | undefined;
  try {
    result = await parse(given, { config, yamlToMomoa });
  } catch (e) {
    // console.error(e);
    const err = e as TokensJSONError;
    expect(stripAnsi(err.message)).toBe(want.error);

    // ensure TokenValidationError contains necessary properties
    // expect(err.node?.type?.length).toBeGreaterThan(0);
    // expect(err.node?.loc?.start?.line).toBeGreaterThanOrEqual(1);
  }

  if (result) {
    expect(want.tokens).toBeTruthy();
    expect(want.error).toBeUndefined();
    const expectedTokens: Record<string, any> = {};
    for (const [id, token] of Object.entries(result.tokens)) {
      expectedTokens[id] = { $value: token.$value };

      // Note: all these additions are a pain, but they are a huge lift to
      // test otherwise complex resolution logic. It’s OK when adding test cases
      // to just “snapshot” it and copy the current value—that’s expected.
      if (token.aliasedBy) {
        expectedTokens[id].aliasedBy = token.aliasedBy;
      }
      if (token.aliasOf) {
        expectedTokens[id].aliasOf = token.aliasOf;
      }
      if (token.aliasChain?.length) {
        expectedTokens[id].aliasChain = token.aliasChain;
      }
      if (token.partialAliasOf) {
        expectedTokens[id].partialAliasOf = token.partialAliasOf;
      }
      if (token.dependencies?.length) {
        expectedTokens[id].dependencies = token.dependencies;
      }
    }
    expect(expectedTokens).toEqual(want.tokens);
  }
}
