import {build} from '@cobalt-ui/cli/dist/build.js';
import {execa} from 'execa';
import fs from 'fs';
import {fileURLToPath} from 'url';
import {beforeAll, describe, test, expect} from 'vitest';
import pluginTS from '../dist/index.js';

const FIXTURES_DIR = new URL('./fixtures/', import.meta.url);

describe('plugin-ts', () => {
  beforeAll(async () => {
    await Promise.all(
      fs.readdirSync(FIXTURES_DIR).map(async (dir) => {
        const base = new URL(`${dir}/`, FIXTURES_DIR);
        if (!fs.statSync(fileURLToPath(base).replace(/\/$/, '')).isDirectory()) return;
        const tokens = new URL('./given.json', base);
        const given = JSON.parse(fs.readFileSync(tokens, 'utf8'));
        await build(given, {tokens, outDir: base, plugins: [pluginTS({filename: 'given.ts'})]});
      }),
    );
  });

  test('types and runtime', async () => {
    // valid TS generated
    const tsx = execa('npx', ['tsc'], {cwd: FIXTURES_DIR});
    if (!tsx || !tsx.stdout) throw new Error('Could not execute `tsc`');
    tsx.stdout.pipe(process.stdout); // pipe output to stdout in realtime
    await tsx;

    // compare generated JS to expected
    const given = fs.readFileSync(new URL('./basic/given.js', FIXTURES_DIR), 'utf8');
    const expected = fs.readFileSync(new URL('./basic/expected.js', FIXTURES_DIR), 'utf8');
    expect(given).toBe(expected);
  });
});
