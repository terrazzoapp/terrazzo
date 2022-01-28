import { build } from '@cobalt-ui/cli/dist/build.js';
import { expect } from 'chai';
import pluginSass from '../dist/index.js';
import fs from 'fs';

const FIXTURES_DIR = new URL('./fixtures/', import.meta.url);

for (const test of fs.readdirSync(FIXTURES_DIR)) {
  it(test, async () => {
    const base = new URL(`./${test}/`, FIXTURES_DIR);
    const outDir = new URL('./dist/', base);
    const given = JSON.parse(fs.readFileSync(new URL('./given.json', base)));
    await build(given, { outDir, plugins: [pluginSass()] });

    const got = fs.readFileSync(new URL('./index.scss', outDir), 'utf8');
    const want = fs.readFileSync(new URL('./want.scss', base), 'utf8');

    const lines1 = got.split('\n');
    const lines2 = want.split('\n');
    expect(got).to.equal(want);
  });
}
