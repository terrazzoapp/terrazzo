import { describe, it } from 'vitest';
import { DEFAULT_FILENAME, parserTest, type Test } from './test-utils.js';

describe('$extends', () => {
  const tests: Test[] = [
    [
      'override + extension',
      {
        given: {
          src: {
            base: {
              color: { $type: 'color', $value: { colorSpace: 'srgb', components: [0, 0, 0.8] } },
              spacing: { $type: 'dimension', $value: { value: 16, unit: 'px' } },
            },
            extended: {
              $extends: '{base}',
              color: { $type: 'color', $value: { colorSpace: 'srgb', components: [1, 0, 0] } },
              border: {
                $type: 'border',
                $value: { width: { value: 1, unit: 'px' }, style: 'solid', color: '{extended.color}' },
              },
            },
          },
        },
        want: {
          tokens: {
            'base.color': { $value: { colorSpace: 'srgb', components: [0, 0, 0.8], alpha: 1 } },
            'base.spacing': { $value: { value: 16, unit: 'px' } },
            'extended.color': {
              $value: { colorSpace: 'srgb', components: [1, 0, 0], alpha: 1 },
              aliasedBy: ['extended.border'],
            },
            'extended.spacing': { $value: { value: 16, unit: 'px' } },
            'extended.border': {
              $value: {
                width: { value: 1, unit: 'px' },
                style: 'solid',
                color: { colorSpace: 'srgb', components: [1, 0, 0], alpha: 1 },
              },
              dependencies: ['#/extended/color/$value'],
              partialAliasOf: { color: 'extended.color' },
            },
          },
        },
      },
    ],
    [
      'invalid: non-alias',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: { color: { $extends: 'bad-value' } },
          },
        ],
        want: {
          error: `[parser:init] $extends must be a valid alias

  1 | {
  2 |   "color": {
> 3 |     "$extends": "bad-value"
    |                 ^
  4 |   }
  5 | }`,
        },
      },
    ],
    [
      'invalid: token',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              color: {
                blue: { $type: 'color', $value: { colorSpace: 'srgb', components: [0, 0, 1] } },
                red: {
                  $extends: '{color.blue}',
                  $type: 'color',
                  $value: { colorSpace: 'srgb', components: [0, 0, 1] },
                },
              },
            },
          },
        ],
        want: {
          error: `[parser:init] $extends can’t exist within a token

  13 |     },
  14 |     "red": {
> 15 |       "$extends": "{color.blue}",
     |                   ^
  16 |       "$type": "color",
  17 |       "$value": {
  18 |         "colorSpace": "srgb",`,
        },
      },
    ],
    [
      'invalid: self-referential',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              button: {
                color: { $type: 'color', $value: { colorSpace: 'srgb', components: [0, 0, 0.8] } },
                secondary: { $extends: '{button}' },
              },
            },
          },
        ],
        want: {
          error: `[parser:init] Circular $extends detected

  13 |     },
  14 |     "secondary": {
> 15 |       "$extends": "{button}"
     |                   ^
  16 |     }
  17 |   }
  18 | }`,
        },
      },
    ],
    [
      'invalid: circular',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              groupA: { $extends: '{groupB}', token: { $type: 'number', $value: 100 } },
              groupB: { $extends: '{groupA}', token: { $type: 'number', $value: 200 } },
            },
          },
        ],
        want: {
          error: `[parser:init] Circular $extends detected

  1 | {
  2 |   "groupA": {
> 3 |     "$extends": "{groupB}",
    |                 ^
  4 |     "token": {
  5 |       "$type": "number",
  6 |       "$value": 100`,
        },
      },
    ],
  ];

  it.each(tests)('%s', async (_, { given, want }) => {
    await parserTest({ given, want });
  });
});
