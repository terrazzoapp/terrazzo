import {describe, expect, test} from 'vitest';
import {camelize, kebabinate, objKey} from './string.js';

describe('camelize', () => {
  test('basic', () => {
    expect(camelize('string-To.Camelize')).toBe('stringToCamelize');
  });
});

describe('kebabinate', () => {
  test('basic', () => {
    expect(kebabinate('stringToKebabinate')).toBe('string-to-kebabinate');
  });
});

describe('objKey', () => {
  test('basic', () => {
    // JS-valid keys
    expect(objKey('valid')).toBe('valid');
    expect(objKey('$valid')).toBe('$valid');
    expect(objKey('_valid')).toBe('_valid');

    // JS-invalid keys
    expect(objKey('123')).toBe("'123'");
    expect(objKey('1invalid')).toBe("'1invalid'");
    expect(objKey('in-valid')).toBe("'in-valid'");
    expect(objKey('in.valid')).toBe("'in.valid'");
  });
});
