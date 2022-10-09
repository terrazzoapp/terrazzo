import {build} from '@cobalt-ui/cli/dist/build.js';
import fs from 'fs';
import {expect, test} from 'vitest';
import pluginCSS from '../dist/index.js';

const FIXTURES_DIR = new URL('./fixtures/', import.meta.url);

for (const name of fs.readdirSync(FIXTURES_DIR)) {
  test(name, async () => {
    const base = new URL(`./${name}/`, FIXTURES_DIR);
    const outDir = new URL('./dist/', base);
    const given = JSON.parse(fs.readFileSync(new URL('./given.json', base)));
    await build(given, {
      outDir,
      plugins: [
        pluginCSS({
          modeSelectors: {
            'color#light': ['[data-color-theme="light"]'],
            'color#dark': ['[data-color-theme="dark"]'],
            'color#light-colorblind': ['[data-color-theme="light-colorblind"]'],
            'color#light-high-contrast': ['[data-color-theme="light-high-contrast"]'],
            'color#dark-dimmed': ['[data-color-theme="dark-dimmed"]'],
            'color#dark-high-contrast': ['[data-color-theme="high-contrast"]'],
            'color#dark-colorblind': ['[data-color-theme="dark-colorblind"]'],
          },
        }),
      ],
    });

    const got = fs.readFileSync(new URL('./tokens.css', outDir), 'utf8');
    const want = fs.readFileSync(new URL('./want.css', base), 'utf8');
    expect(got).to.equal(want);
  });
}
