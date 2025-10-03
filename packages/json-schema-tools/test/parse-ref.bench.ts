import Pointer from '@apidevtools/json-schema-ref-parser/lib/pointer.js';
import { bench, describe } from 'vitest';
import { parseRef } from '../src/index.js';

const TEST_CASES = ['#/foo/bar', 'https://example.com/schema#/foo/bar', '#/foo~0/~1bar', ''];

describe('benchmark', () => {
  bench('@terrazzo/json-schema-tools', () => {
    parseRef(TEST_CASES[0]!);
  });

  bench('@terrazzo/json-schema-tools (full)', () => {
    for (const t of TEST_CASES) {
      parseRef(t);
    }
  });

  bench('@apidevtools/json-schema-ref-parser', () => {
    (Pointer as any).parse(TEST_CASES[0]);
  });

  bench('@apidevtools/json-schema-ref-parser (full)', () => {
    for (const t of TEST_CASES) {
      (Pointer as any).parse(t);
    }
  });
});
