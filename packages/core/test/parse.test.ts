import { describe, expect, it } from 'vitest';
import { parse } from '../src/parse/index.js';

const COLOR_BLUE = `color(srgb 0 0.3 1.0)`;

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
    }
  }`);
      expect(errors?.[0]).toMatchInlineSnapshot(
        `
        "JSONError: Expected ',' or '}' after property value in JSON at position 102

          5 |       "$value": "${COLOR_BLUE}"
          6 |     }
        > 7 |   }
            |    ^
        "
      `,
      );
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
