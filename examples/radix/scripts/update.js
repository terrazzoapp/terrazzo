import * as colors from '@radix-ui/colors';
import fs from 'node:fs';
import yaml from 'yaml';

// settings
const ACTION_COLOR = 'iris';
const ERROR_COLOR = 'ruby';
const WARN_COLOR = 'amber';
const SUCCESS_COLOR = 'grass';
for (const c of [ACTION_COLOR, ERROR_COLOR, WARN_COLOR, SUCCESS_COLOR]) {
  if (!colors[c]) {
    throw new Error(`Palette "${c}" does not exist in Radix UI`);
  }
}

const tokens = {
  color: {
    $type: 'color',
    primitive: {},
    overlay: {},
  },
};

/** add primitive palette to color */
function addPrimitivePalette(name, light, dark) {
  const lightValues = Object.values(light);
  const darkValues = Object.values(dark);

  tokens.color.primitive[name] = {};

  for (let i = 0; i < lightValues.length; i++) {
    tokens.color.primitive[name][`${i + 1}`] = {
      $value: lightValues[i],
      $extensions: {
        mode: {
          light: lightValues[i],
          dark: darkValues[i],
        },
      },
    };
  }
}

// build primitives
for (const name of [
  'gray',
  'mauve',
  'slate',
  'sage',
  'olive',
  'sand',
  'gold',
  'bronze',
  'brown',
  'yellow',
  'amber',
  'orange',
  'tomato',
  'red',
  'ruby',
  'crimson',
  'pink',
  'plum',
  'purple',
  'violet',
  'iris',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'jade',
  'green',
  'grass',
  'lime',
  'mint',
  'sky',
]) {
  addPrimitivePalette(name, colors[name], colors[`${name}Dark`]);
}

// overlays are unique
const overlays = [
  { name: 'black', values: Object.values(colors.blackA) },
  { name: 'white', values: Object.values(colors.whiteA) },
];
for (const { name, values } of overlays) {
  tokens.color.overlay[name] = {};
  for (let i = 0; i < values.length; i++) {
    tokens.color.overlay[name][`${i + 1}`] = {
      $value: values[i],
    };
  }
}

// build semantic layer
tokens.color.bg = {
  default: { $value: '{color.primitive.gray.1}' },
  subtle: { $value: '{color.primitive.gray.2}' },
  ui: { $value: '{color.primitive.gray.3}' },
  hover: { $value: '{color.primitive.gray.4}' },
  active: { $value: '{color.primitive.gray.5}' },
  action: {
    default: { $value: '{color.primitive.iris.9}' },
    hover: { $value: '{color.primitive.iris.10}' },
  },
  error: {
    default: { $value: '{color.primitive.ruby.9}' },
    hover: { $value: '{color.primitive.ruby.10}' },
  },
  success: {
    default: { $value: '{color.primitive.grass.9}' },
    hover: { $value: '{color.primitive.grass.10}' },
  },
  warn: {
    default: { $value: '{color.primitive.amber.9}' },
    hover: { $value: '{color.primitive.amber.10}' },
  },
};
tokens.color.text = {
  default: { $value: '{color.primitive.gray.12}' },
  subtle: { $value: '{color.primitive.gray.11}' },
  action: { default: { $value: '{color.primitive.gray.1}' } },
  error: { default: { $value: '{color.primitive.gray.1}' } },
  success: { default: { $value: '{color.primitive.gray.1}' } },
  warn: { default: { $value: '{color.primitive.gray.1}' } },
};
tokens.border = {
  color: {
    $type: 'color',
    default: { $value: '{color.primitive.gray.6}' },
    hover: { $value: '{color.primitive.gray.7}' },
  },
};

// write to file
fs.writeFileSync(new URL('../tokens-test.yaml', import.meta.url), yaml.stringify(tokens));
