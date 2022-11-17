import primer from '@primer/primitives';
import octicons from '@primer/octicons';
import fs from 'node:fs';
import {URL} from 'node:url';

const {colors, spacing, typography} = primer.default;

const tokensPath = new URL('../tokens.json', import.meta.url);
const schema = JSON.parse(fs.readFileSync(tokensPath));

// color
for (const [mode, components] of Object.entries(colors)) {
  for (const [colorName, value] of Object.entries(components.scale)) {
    if (!schema.tokens.color[colorName])
      schema.tokens.color[colorName] = {
        type: 'color',
        value: '#000000',
        mode: {},
      };
    if (typeof value == 'string') {
      if (mode == 'light') schema.tokens.color[colorName].value = value;
      schema.tokens.color[colorName].mode[mode] = value;
    } else if (Array.isArray(value)) {
      value.forEach((shade, i) => {
        if (mode == 'light') schema.tokens.color[`${colorName}_${i}`].value = shade;
        schema.tokens.color[`${colorName}_${i}`].mode[mode] = shade;
      });
    }
  }
}

// spacing / typography
// (manually updated)

// icons
for (const icon of Object.values(octicons)) {
  for (const h of Object.keys(icon.heights)) {
    const id = `${icon.name}-${h}`;
    fs.writeFileSync(
      new URL(`../icon/${id}.svg`, import.meta.url),
      icon.toSVG({
        height: parseInt(h, 10),
      }),
    );
    if (!schema.tokens.icon[id]) schema.tokens.icon[id] = {type: 'file', value: ''};
    schema.tokens.icon[id].value = `./icon/${id}.svg`;
  }
}

// FINISH
fs.writeFileSync(tokensPath, JSON.stringify(schema));
