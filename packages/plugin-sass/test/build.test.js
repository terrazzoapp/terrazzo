import {build} from '@cobalt-ui/cli/dist/build.js';
import fs from 'fs';
import {expect, test} from 'vitest';
import pluginSass from '../dist/index.js';

const FIXTURES_DIR = new URL('./fixtures/', import.meta.url);

for (const name of fs.readdirSync(FIXTURES_DIR)) {
  test(name, async () => {
    const base = new URL(`./${name}/`, FIXTURES_DIR);
    const outDir = new URL('./dist/', base);
    const given = JSON.parse(fs.readFileSync(new URL('./given.json', base)));
    await build(given, {outDir, plugins: [pluginSass()]});

    const got = fs.readFileSync(new URL('./index.scss', outDir), 'utf8');
    const want = fs.readFileSync(new URL('./want.scss', base), 'utf8');

    expect(got).to.equal(want);
  });
}
