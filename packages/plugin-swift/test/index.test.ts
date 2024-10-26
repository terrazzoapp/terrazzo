import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build, defineConfig, parse } from '@terrazzo/parser';
import { describe, expect, it } from 'vitest';
import swift from '../src/index.js';

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
    const tokensJSON = new URL('./tokens.json', cwd);
    const { tokens, sources } = await parse([{ filename: tokensJSON, src: fs.readFileSync(tokensJSON, 'utf8') }], {
      config,
    });
    const result = await build(tokens, { config, sources });
    for (const { filename, contents } of result.outputFiles) {
      expect(contents).toMatchFileSnapshot(fileURLToPath(new URL(filename, cwd)));
    }
  });
});
