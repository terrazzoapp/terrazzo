import { build, defineConfig, parse } from '@terrazzo/parser';
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import swift from '../src/index.js';
import { fileURLToPath } from 'node:url';

describe('@terrazzo/plugin-swift', () => {
  it('basic', async () => {
    const cwd = new URL('./color/', import.meta.url);
    const config = defineConfig(
      {
        outDir: 'color',
        plugins: [
          swift({
            catalogName: 'Want',
          }),
        ],
      },
      { cwd },
    );
    const json = fs.readFileSync(new URL('./tokens.json', cwd), 'utf-8');
    const { tokens, ast } = await parse(json, { config });
    const result = await build(tokens, { config, ast });
    for (const { filename, contents } of result.outputFiles) {
      expect(contents).toMatchFileSnapshot(fileURLToPath(new URL(filename, cwd)));
    }
  });
});
