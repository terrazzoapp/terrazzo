import Pointer from '@apidevtools/json-schema-ref-parser/dist/lib/pointer.js';
import { test } from 'vitest';

import { parseRef } from '../src/index.js';

const TEST_CASES = ['#/foo/bar', 'https://example.com/schema#/foo/bar', '#/foo~0/~1bar', ''];

test('benchmark', async ({ bench }) => {
  await bench('@terrazzo/json-schema-tools', () => {
    parseRef(TEST_CASES[0]!);
  }).run();

  await bench('@terrazzo/json-schema-tools (full)', () => {
    for (const t of TEST_CASES) {
      parseRef(t);
    }
  }).run();

  await bench('@apidevtools/json-schema-ref-parser', () => {
    (Pointer as any).parse(TEST_CASES[0]);
  }).run();

  await bench('@apidevtools/json-schema-ref-parser (full)', () => {
    for (const t of TEST_CASES) {
      (Pointer as any).parse(t);
    }
  }).run();
});
