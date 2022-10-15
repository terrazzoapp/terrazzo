/**
 * Update READMEs
 *
 * For the docs pages that are just duplicates of other markdown files, automate them
 */

import fs from 'fs';

const updates = {
  '../../packages/plugin-css/README.md': '../src/pages/docs/plugins/css.md',
  '../../packages/plugin-sass/README.md': '../src/pages/docs/plugins/sass.md',
  '../../packages/plugin-js/README.md': '../src/pages/docs/plugins/js.md',
};

for (const [input, output] of Object.entries(updates)) {
  const src = fs.readFileSync(new URL(input, import.meta.url), 'utf8');
  const dest = fs.readFileSync(new URL(output, import.meta.url), 'utf8');
  const parts = dest.split('---');
  parts[parts.length - 1] = `\n\n${src}`;
  fs.writeFileSync(new URL(output, import.meta.url), parts.join('---'));
}
