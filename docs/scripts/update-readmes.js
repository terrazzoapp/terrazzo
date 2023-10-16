/**
 * Update READMEs
 *
 * For the docs pages that are just duplicates of other markdown files, automate them
 */

import fs from 'node:fs';
import {URL} from 'node:url';
const FRONTMATTER_RE = /^---/gm;

const updates = {
  '../../packages/plugin-css/README.md': '../src/pages/docs/integrations/css.md',
  '../../packages/plugin-sass/README.md': '../src/pages/docs/integrations/sass.md',
  '../../packages/plugin-js/README.md': '../src/pages/docs/integrations/js.md',
};

const urlRewrites = {
  '../plugin-css/': './css',
  '../plugin-js/': './js',
  '../plugin-sass/': './sass',
};

for (const [input, output] of Object.entries(updates)) {
  let src = fs.readFileSync(new URL(input, import.meta.url), 'utf8');
  for (const [find, replace] of Object.entries(urlRewrites)) {
    src = src.replace(new RegExp(`\\(${find}\\)`, 'g'), `(${replace})`);
  }

  const dest = fs.readFileSync(new URL(output, import.meta.url), 'utf8');
  const parts = dest.split(FRONTMATTER_RE);
  parts[parts.length - 1] = `\n\n${src}`;
  fs.writeFileSync(new URL(output, import.meta.url), parts.join('---'));
}
