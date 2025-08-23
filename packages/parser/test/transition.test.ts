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
      'valid: optional delay',
      {
        given: [
          {
            filename: DEFAULT_FILENAME,
            src: {
              transition: {
                'ease-in-out': {
                  $type: 'transition',
                  $value: { duration: '{timing.quick}', timingFunction: '{ease.in-out}' },
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
            },
            'timing.quick': { $value: { value: 150, unit: 'ms' }, aliasedBy: ['transition.ease-in-out'] },
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
          error: `Missing required property "duration"

/tokens.json:5:17

  3 |     "ease-in-out": {
  4 |       "$type": "transition",
> 5 |       "$value": {
    |                 ^
  6 |         "timingFunction": [
  7 |           0.42,
  8 |           0,`,
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
                  $value: { duration: '150ms' },
                },
              },
            },
          },
        ],
        want: {
          error: `Missing required property "timingFunction"

/tokens.json:5:17

  3 |     "ease-in-out": {
  4 |       "$type": "transition",
> 5 |       "$value": {
    |                 ^
  6 |         "duration": "150ms"
  7 |       }
  8 |     }`,
        },
      },
    ],
  ];

  it.each(tests)('%s', (_, testCase) => parserTest(testCase));
});
