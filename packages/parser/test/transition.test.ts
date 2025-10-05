import { describe, it } from 'vitest';
import { DEFAULT_FILENAME, parserTest, type Test } from './test-utils.js';

describe('9.4 Transition', () => {
  const tests: Test[] = [
    [
      'valid',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              transition: {
                'ease-in-out': {
                  $type: 'transition',
                  $value: {
                    duration: '{timing.quick}',
                    timingFunction: '{ease.in-out}',
                    delay: { value: 0, unit: 'ms' },
                  },
                },
              },
              timing: {
                $type: 'duration',
                quick: { $value: { value: 150, unit: 'ms' } },
              },
              ease: {
                $type: 'cubicBezier',
                'in-out': { $value: [0.42, 0, 0.58, 1] },
              },
            },
          },
        ],
        want: {
          tokens: {
            'transition.ease-in-out': {
              $value: {
                duration: { value: 150, unit: 'ms' },
                timingFunction: [0.42, 0, 0.58, 1],
                delay: { value: 0, unit: 'ms' },
              },
              partialAliasOf: {
                duration: 'timing.quick',
                timingFunction: 'ease.in-out',
              },
              dependencies: ['#/ease/in-out/$value', '#/timing/quick/$value'],
            },
            'timing.quick': {
              $value: { value: 150, unit: 'ms' },
              aliasedBy: ['transition.ease-in-out'],
            },
            'ease.in-out': { $value: [0.42, 0, 0.58, 1], aliasedBy: ['transition.ease-in-out'] },
          },
        },
      },
    ],
    [
      'invalid: missing duration',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              transition: {
                'ease-in-out': {
                  $type: 'transition',
                  $value: { timingFunction: [0.42, 0, 0.58, 1] },
                },
              },
            },
          },
        ],
        want: {
          error: `[lint:core/valid-transition] Missing required properties: duration, delay, and timingFunction.

  3 |     "ease-in-out": {
  4 |       "$type": "transition",
> 5 |       "$value": {
    |                 ^
  6 |         "timingFunction": [
  7 |           0.42,
  8 |           0,

[lint:lint] 1 error`,
        },
      },
    ],
    [
      'invalid: missing delay',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              transition: {
                'ease-in-out': {
                  $type: 'transition',
                  $value: {
                    duration: { value: 150, unit: 'ms' },
                    timingFunction: [0.42, 0, 0.58, 1],
                  },
                },
              },
            },
          },
        ],
        want: {
          error: `[lint:core/valid-transition] Missing required properties: duration, delay, and timingFunction.

  3 |     "ease-in-out": {
  4 |       "$type": "transition",
> 5 |       "$value": {
    |                 ^
  6 |         "duration": {
  7 |           "value": 150,
  8 |           "unit": "ms"

[lint:lint] 1 error`,
        },
      },
    ],
    [
      'invalid: missing timingFunction',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              transition: {
                'ease-in-out': {
                  $type: 'transition',
                  $value: {
                    duration: { value: 150, unit: 'ms' },
                    delay: { value: 0, unit: 'ms' },
                  },
                },
              },
            },
          },
        ],
        want: {
          error: `[lint:core/valid-transition] Missing required properties: duration, delay, and timingFunction.

  3 |     "ease-in-out": {
  4 |       "$type": "transition",
> 5 |       "$value": {
    |                 ^
  6 |         "duration": {
  7 |           "value": 150,
  8 |           "unit": "ms"

[lint:lint] 1 error`,
        },
      },
    ],
    [
      'invalid: unknown prop',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              transition: {
                'ease-in-out': {
                  $type: 'transition',
                  $value: {
                    duration: { value: 100, unit: 'ms' },
                    timingFunction: [0, 0, 1, 1],
                    delay: { value: 0, unit: 'ms' },
                    bad: true,
                  },
                },
              },
            },
          },
        ],
        want: {
          error: `[lint:core/valid-transition] Unknown property: "bad".

  18 |           "unit": "ms"
  19 |         },
> 20 |         "bad": true
     |                ^
  21 |       }
  22 |     }
  23 |   }

[lint:lint] 1 error`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
