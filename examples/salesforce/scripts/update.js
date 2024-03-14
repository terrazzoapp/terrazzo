import themeOne from '@salesforce-ux/design-system/design-tokens/dist/theme-one-salesforce.common.js';
import { formatHex, useMode, modeRgb } from 'culori/fn';
import fs from 'node:fs';
import { URL } from 'node:url';

const tokensPath = new URL('../tokens.json', import.meta.url);
const schema = JSON.parse(fs.readFileSync(tokensPath));

// color
const palette = Object.entries(themeOne).filter(([k]) => k.startsWith('palette'));
palette.sort((a, b) => a[0].localeCompare(b[0], 'en-us', { numeric: true }));
const rgb = useMode(modeRgb);
for (const [colorName, value] of palette) {
  schema.tokens.palette[
    colorName
      .replace('palette', '')
      .replace(/(\d+)$/, '_$1')
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toLocaleLowerCase()
  ] = {
    type: 'color',
    value: formatHex(rgb(value)),
  };
}

// FINISH
fs.writeFileSync(tokensPath, JSON.stringify(schema));
