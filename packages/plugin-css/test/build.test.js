import { build } from '@cobalt-ui/cli/dist/build.js';
import { expect } from 'chai';
import pluginCSS from '../dist/index.js';
import fs from 'fs';

const FIXTURES_DIR = new URL('./fixtures/', import.meta.url);

for (const test of fs.readdirSync(FIXTURES_DIR)) {
  it(test, async () => {
    const base = new URL(`./${test}/`, FIXTURES_DIR);
    const outDir = new URL('./dist/', base);
    const given = JSON.parse(fs.readFileSync(new URL('./given.json', base)));
    await build(given, {
      outDir,
      plugins: [
        pluginCSS({
          modeSelectors: {
            color: {
              light: ['.theme--light'],
              dark: ['.theme--dark'],
              'light-colorblind': ['.theme--light-colorblind'],
              'light-high-contrast': ['.theme--light-high-contrast'],
              'dark-dimmed': ['.theme--dark-dimmed'],
              'dark-high-contrast': ['.theme--high-contrast'],
              'dark-colorblind': ['.theme--dark-colorblind'],
            },
          },
        }),
      ],
    });

    const got = fs.readFileSync(new URL('./tokens.css', outDir), 'utf8');
    const want = fs.readFileSync(new URL('./want.css', base), 'utf8');
    expect(got).to.equal(want);
  });
}
