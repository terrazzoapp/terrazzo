import { describe, expect, test } from 'vitest';
import { camelize, indentBlock, kebabinate, objKey, padStr } from '../src/string.js';

describe('camelize', () => {
  test('basic', () => {
    expect(camelize('string-To.Camelize')).toMatchInlineSnapshot(`"stringToCamelize"`);
  });
});

describe('kebabinate', () => {
  test('basic', () => {
    expect(kebabinate('stringToKebabinate')).toMatchInlineSnapshot(`"string-to-kebabinate"`);
    expect(kebabinate('color.ui.contrast.00')).toMatchInlineSnapshot(`"color-ui-contrast-00"`);
    expect(kebabinate('color.ui.contrast.05')).toMatchInlineSnapshot(`"color-ui-contrast-05"`);
  });
});

describe('objKey', () => {
  test('basic', () => {
    // JS-valid keys
    expect(objKey('valid')).toMatchInlineSnapshot(`"valid"`);
    expect(objKey('$valid')).toMatchInlineSnapshot(`"$valid"`);
    expect(objKey('_valid')).toMatchInlineSnapshot(`"_valid"`);
  });

  test('chaotic', () => {
    expect(objKey('123')).toMatchInlineSnapshot(`"'123'"`);
    expect(objKey('1invalid')).toMatchInlineSnapshot(`"'1invalid'"`);
    expect(objKey('in-valid')).toMatchInlineSnapshot(`"'in-valid'"`);
    expect(objKey('in.valid')).toMatchInlineSnapshot(`"'in.valid'"`);
  });
});

describe('padStr', () => {
  test('basic', () => {
    expect(padStr('input', 10)).toMatchInlineSnapshot(`"input     "`);
    expect(padStr('input', 10, 'right')).toMatchInlineSnapshot(`"     input"`);
    expect(padStr('input', 10, 'center')).toMatchInlineSnapshot(`"  input   "`);
    expect(padStr('reallyreallylongword', 5, 'center')).toMatchInlineSnapshot(`"reallyreallylongword"`);
  });

  test('chaotic', () => {
    expect(padStr('input', -100, 'center')).toMatchInlineSnapshot(`"input"`);
    expect(padStr('input', Infinity, 'center')).toMatchInlineSnapshot(
      `"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 input                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  "`,
    );
    expect(padStr('input', -Infinity, 'center')).toMatchInlineSnapshot(`"input"`);
    expect(padStr('input', -0, 'center')).toMatchInlineSnapshot(`"input"`);
    expect(padStr('input', NaN, 'center')).toMatchInlineSnapshot(`"input"`);
  });
});

describe('indentBlock', () => {
  test('basic', () => {
    expect(indentBlock('my text', 4)).toMatchInlineSnapshot(`"    my text"`);
    expect(indentBlock(' my text', 4)).toMatchInlineSnapshot(`"    my text"`);
    expect(indentBlock('         my text', 4)).toMatchInlineSnapshot(`"    my text"`);
    expect(
      indentBlock(
        `line 1
    line 2
  line 3
line 4`,
        2,
      ),
    ).toMatchInlineSnapshot(`
      "  line 1
        line 2
        line 3
        line 4"
    `);
  });
});
