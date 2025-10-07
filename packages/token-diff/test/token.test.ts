import { describe, expect, it } from 'vitest';

import { diffTokens } from '../src/token.js';
import type { TokenNormalized } from '@terrazzo/token-tools';

describe('diffTokens', () => {
  // Helper function to create a proper TokenNormalized object
  const createToken = (
    name: string,
    type: TokenNormalized['$type'],
    value: any,
    options: {
      description?: string;
      deprecated?: string | boolean;
      extensions?: Record<string, unknown>;
    } = {}
  ): TokenNormalized => {
    return {
      id: name,
      $type: type,
      $value: value,
      $description: options.description,
      $deprecated: options.deprecated,
      $extensions: options.extensions || {},
      jsonID: `/${name.split('.').join('/')}`,
      originalValue: undefined,
      aliasOf: undefined,
      aliasChain: undefined,
      aliasedBy: undefined,
      dependencies: undefined,
      partialAliasOf: undefined,
      source: {
        filename: 'test.tokens.json',
        node: {} as any, // Mock node for testing
      },
      group: {
        $description: undefined,
        $deprecated: undefined,
        $extensions: undefined,
        $type: undefined,
        id: name.split('.').slice(0, -1).join('.') || 'root',
        tokens: [name],
      },
      mode: {
        '.': {
          $value: value,
          aliasOf: undefined,
          aliasChain: undefined,
          aliasedBy: undefined,
          partialAliasOf: undefined,
          dependencies: undefined,
          source: {
            filename: 'test.tokens.json',
            node: {} as any,
          },
          originalValue: value,
        },
      },
    } as TokenNormalized;
  };

  it('should return no changes for identical tokens', () => {
    const token = createToken('color.primary', 'color', '#ff0000');

    const result = diffTokens(token, token);

    expect(result).toEqual({
      changeType: 'none',
      old: {},
      new: {},
    });
  });

  it('should detect added tokens', () => {
    const newToken = createToken('color.primary', 'color', '#ff0000');

    const result = diffTokens(null, newToken);

    expect(result.changeType).toBe('added');
    expect(result.old).toEqual({});
    expect(result.new).toMatchObject({
      id: 'color.primary',
      $type: 'color',
      $value: '#ff0000',
    });
  });

  it('should detect removed tokens', () => {
    const oldToken = createToken('color.primary', 'color', '#ff0000');

    const result = diffTokens(oldToken, null);

    expect(result.changeType).toBe('removed');
    expect(result.new).toEqual({});
    expect(result.old).toMatchObject({
      id: 'color.primary',
      $type: 'color',
      $value: '#ff0000',
    });
  });

  it('should detect changes in token values', () => {
    const oldToken = createToken('color.primary', 'color', '#ff0000');
    const newToken = createToken('color.primary', 'color', '#00ff00');

    const result = diffTokens(oldToken, newToken);

    expect(result.changeType).toBe('modified');
    expect(result.old).toMatchObject({
      $value: '#ff0000',
    });
    expect(result.new).toMatchObject({
      $value: '#00ff00',
    });
  });

  it('should detect changes in token type', () => {
    const oldToken = createToken('test.token', 'color', '#ff0000');
    const newToken = createToken('test.token', 'string', 'red');

    const result = diffTokens(oldToken, newToken);

    expect(result.changeType).toBe('modified');
    expect(result.old).toMatchObject({
      $type: 'color',
      $value: '#ff0000',
    });
    expect(result.new).toMatchObject({
      $type: 'string',
      $value: 'red',
    });
  });

  it('should detect changes in token description', () => {
    const oldToken = createToken('color.primary', 'color', '#ff0000', {
      description: 'Old description'
    });
    const newToken = createToken('color.primary', 'color', '#ff0000', {
      description: 'New description'
    });

    const result = diffTokens(oldToken, newToken);

    expect(result.changeType).toBe('modified');
    expect(result.old).toMatchObject({
      $description: 'Old description',
    });
    expect(result.new).toMatchObject({
      $description: 'New description',
    });
  });

  it('should detect changes in deprecation status', () => {
    const oldToken = createToken('color.primary', 'color', '#ff0000', {
      deprecated: false
    });
    const newToken = createToken('color.primary', 'color', '#ff0000', {
      deprecated: true
    });

    const result = diffTokens(oldToken, newToken);

    expect(result.changeType).toBe('modified');
    expect(result.old).toMatchObject({
      $deprecated: false,
    });
    expect(result.new).toMatchObject({
      $deprecated: true,
    });
  });

  it('should detect changes in extensions', () => {
    const oldToken = createToken('color.primary', 'color', '#ff0000', {
      extensions: { customProp: 'oldValue' }
    });
    const newToken = createToken('color.primary', 'color', '#ff0000', {
      extensions: { customProp: 'newValue' }
    });

    const result = diffTokens(oldToken, newToken);

    expect(result.changeType).toBe('modified');
    expect(result.old).toMatchObject({
      $extensions: { customProp: 'oldValue' },
    });
    expect(result.new).toMatchObject({
      $extensions: { customProp: 'newValue' },
    });
  });

  it('should handle dimension tokens', () => {
    const oldToken = createToken('spacing.large', 'dimension', { value: 16, unit: 'px' });
    const newToken = createToken('spacing.large', 'dimension', { value: 20, unit: 'px' });

    const result = diffTokens(oldToken, newToken);

    expect(result.changeType).toBe('modified');
    expect(result.old).toMatchObject({
      $value: { value: 16 },
    });
    expect(result.new).toMatchObject({
      $value: { value: 20 },
    });
  });

  it('should handle string tokens', () => {
    const oldToken = createToken('text.heading', 'string', 'Old Heading');
    const newToken = createToken('text.heading', 'string', 'New Heading');

    const result = diffTokens(oldToken, newToken);

    expect(result.changeType).toBe('modified');
    expect(result.old).toMatchObject({
      $value: 'Old Heading',
    });
    expect(result.new).toMatchObject({
      $value: 'New Heading',
    });
  });

  it('should handle complex nested objects', () => {
    const oldToken = createToken('test.complex', 'color', '#ff0000', {
      extensions: {
        nested: {
          prop1: 'value1',
          prop2: { deep: 'oldDeep' }
        }
      }
    });
    const newToken = createToken('test.complex', 'color', '#ff0000', {
      extensions: {
        nested: {
          prop1: 'value1',
          prop2: { deep: 'newDeep' }
        }
      }
    });

    const result = diffTokens(oldToken, newToken);

    expect(result.changeType).toBe('modified');
    expect(result.old).toMatchObject({
      $extensions: {
        nested: {
          prop2: { deep: 'oldDeep' }
        }
      }
    });
    expect(result.new).toMatchObject({
      $extensions: {
        nested: {
          prop2: { deep: 'newDeep' }
        }
      }
    });
  });

  it('should handle partial changes in nested objects', () => {
    const oldToken = createToken('test.partial', 'color', '#ff0000', {
      extensions: {
        metadata: {
          author: 'John',
          version: '1.0'
        },
        tags: ['primary']
      }
    });
    const newToken = createToken('test.partial', 'color', '#ff0000', {
      extensions: {
        metadata: {
          author: 'Jane',
          version: '1.0'
        },
        tags: ['primary']
      }
    });

    const result = diffTokens(oldToken, newToken);

    expect(result.changeType).toBe('modified');
    expect(result.old).toMatchObject({
      $extensions: {
        metadata: {
          author: 'John'
        }
      }
    });
    expect(result.new).toMatchObject({
      $extensions: {
        metadata: {
          author: 'Jane'
        }
      }
    });
  });

  it('should return flat format when requested', () => {
    const oldToken = createToken('color.primary', 'color', '#ff0000', {
      extensions: { customProp: 'oldValue' }
    });
    const newToken = createToken('color.primary', 'color', '#ff0000', {
      extensions: { customProp: 'newValue' }
    });

    const result = diffTokens(oldToken, newToken, { flat: true });

    expect(result.changeType).toBe('modified');
    expect(result.old).toHaveProperty('$extensions.customProp', 'oldValue');
    expect(result.new).toHaveProperty('$extensions.customProp', 'newValue');
  });

  it('should return DTCG format by default', () => {
    const oldToken = createToken('color.primary', 'color', '#ff0000', {
      extensions: { customProp: 'oldValue' }
    });
    const newToken = createToken('color.primary', 'color', '#ff0000', {
      extensions: { customProp: 'newValue' }
    });

    const result = diffTokens(oldToken, newToken);

    expect(result.changeType).toBe('modified');
    expect(result.old).toMatchObject({
      $extensions: { customProp: 'oldValue' }
    });
    expect(result.new).toMatchObject({
      $extensions: { customProp: 'newValue' }
    });
  });

  it('should handle tokens with different IDs', () => {
    const oldToken = createToken('color.primary', 'color', '#ff0000');
    const newToken = createToken('color.secondary', 'color', '#ff0000');

    const result = diffTokens(oldToken, newToken);

    expect(result.changeType).toBe('modified');
    expect(result.old).toMatchObject({
      id: 'color.primary',
    });
    expect(result.new).toMatchObject({
      id: 'color.secondary',
    });
  });

  it('should handle tokens with undefined vs defined optional properties', () => {
    const oldToken = createToken('color.primary', 'color', '#ff0000');
    const newToken = createToken('color.primary', 'color', '#ff0000', {
      description: 'A primary color'
    });

    const result = diffTokens(oldToken, newToken);

    expect(result.changeType).toBe('modified');
    expect(result.old).toMatchObject({
      $description: undefined,
    });
    expect(result.new).toMatchObject({
      $description: 'A primary color',
    });
  });

  it('should handle boolean tokens', () => {
    const oldToken = createToken('flag.enabled', 'boolean', true);
    const newToken = createToken('flag.enabled', 'boolean', false);

    const result = diffTokens(oldToken, newToken);

    expect(result.changeType).toBe('modified');
    expect(result.old).toMatchObject({
      $value: true,
    });
    expect(result.new).toMatchObject({
      $value: false,
    });
  });

  it('should handle number tokens', () => {
    const oldToken = createToken('scale.factor', 'number', 1.5);
    const newToken = createToken('scale.factor', 'number', 2.0);

    const result = diffTokens(oldToken, newToken);

    expect(result.changeType).toBe('modified');
    expect(result.old).toMatchObject({
      $value: 1.5,
    });
    expect(result.new).toMatchObject({
      $value: 2.0,
    });
  });
});
