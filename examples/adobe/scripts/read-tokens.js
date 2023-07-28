#! usr/bin/env node

import fs from 'node:fs';

const themes = ['dark', 'darkest', 'light', 'lightest', 'middark', 'midlight'];
const tokensPath = new URL('../tokens.json', import.meta.url);
const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

for (const theme of themes) {
  const contents = fs.readFileSync(new URL(`./inputs/spectrum-${theme}.css`, import.meta.url), 'utf8');
  const lines = contents.split('\n');
  for (const ln of lines) {
    if (ln.startsWith('  --spectrum-')) {
      const [name, value] = ln.replace('  --spectrum').split(':');

      // create token space
      const nameParts = name.split('-');
      let node = tokens;
      for (const namePart of nameParts) {
        if (!node[namePart]) {
          node[namePart] = {};
        }
        node = node[namePart];
      }

      // parse & set value
      let normalizedValue = value.trim().replace(';', '');
      if (normalizedValue.includes(',') && !normalizedValue.startsWith('rgb(')) {
        normalizedValue = `rgb(${normalizedValue})`;
      }
      if (theme === 'light') node.$value = normalizedValue; // just pick a random theme; doesn’t matter
      if (!node.$extensions) node.$extensions = {};
      if (!node.$extensions.mode) node.$extensions.mode = {};
      node.$extensions.mode[theme] = normalizedValue;
    }
  }
}

fs.writeFileSync(tokensPath, JSON.stringify(tokens, undefined, 2));
