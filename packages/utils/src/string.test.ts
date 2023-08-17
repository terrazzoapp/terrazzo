import {describe, expect, test} from 'vitest';
import {camelize, kebabinate} from './string.js';

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
