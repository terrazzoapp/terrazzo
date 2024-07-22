import os from 'node:os';
import stripAnsi from 'strip-ansi';
import { describe, expect, it } from 'vitest';
import { parse } from '../src/parse/index.js';

const COLOR_BLUE = 'color(srgb 0 0.3 1.0)';

describe('parse', () => {
  describe('JSON', () => {
    it('accepts JSON string', () => {
      const { errors, result } = parse(`{
        "color": {
          "blue": { "$type": "color", "$value": "${COLOR_BLUE}" }
        }
      }`);

      expect(errors).toBeUndefined();
      expect(result.tokens.find((t) => t.id === 'color.blue')?.$value).toBe(COLOR_BLUE);
    });

    it('accepts JSON object', () => {
      const { errors, result } = parse({
        color: {
          blue: { $type: 'color', $value: COLOR_BLUE },
        },
      });

      expect(errors).toBeUndefined();
      expect(result.tokens.find((t) => t.id === 'color.blue')?.$value).toBe(COLOR_BLUE);
    });

    it('shows syntax errors', () => {
      const { errors } = parse(`{
  "color": {
    "blue": {
      "$type": "color",
      "$value": "${COLOR_BLUE}"
    },
  }`);

      if (os.platform() === 'darwin') {
        expect(stripAnsi(errors?.[0] ?? '')).toMatchInlineSnapshot(`
          "JSONError: Expected double-quoted property name in JSON at position 102 (line 7 column 3)

            5 |       "$value": "color(srgb 0 0.3 1.0)"
            6 |     },
          > 7 |   }
              |   ^
          "
        `);
      } else {
        // note: this displays very different errors depending on the version of Node and the OS. But just testing that it shows _something_ is sufficient
        expect(errors?.[0]).toMatch(/JSON/);
      }
    });
  });

  describe('YAML', () => {
    it('accepts YAML', () => {
      const { errors, result } = parse(`color:
  blue:
    $type: color
    $value: ${COLOR_BLUE}
`);
      expect(errors).toBeUndefined();
      expect(result.tokens.find((t) => t.id === 'color.blue')?.$value).toBe(COLOR_BLUE);
    });

    it('shows syntax errors', () => {
      const { errors } = parse(`color:
  blue
    $type: color
    $value: color(srgb 0 0.3 1.0)
`);
      expect(errors?.[0]).toMatchInlineSnapshot(`
        "YAMLParseError: Implicit keys need to be on a single line at line 2, column 3:

        color:
          blue
          ^
        "
      `);
    });
  });
});
