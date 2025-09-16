import type { TokenListing } from '@terrazzo/plugin-token-listing';
import { describe, expect, it } from 'vitest';

import { diffListings, validateListing } from '../src/diff.js';

describe('validateListing', () => {
  it('should validate a valid listing', () => {
    const validListing: TokenListing = {
      meta: {
        version: 1,
        authoringTool: 'test',
        modes: [],
        names: {},
        sourceOfTruth: 'test',
      },
      data: [
        {
          $name: 'test.token',
          $type: 'color',
          $description: 'Test token',
          $value: '#ff0000',
          $extensions: {
            'app.terrazzo.listing': {
              names: { web: 'test-token' },
              mode: 'default',
            },
          },
        },
      ],
    };

    expect(() => validateListing(validListing)).not.toThrow();

    // TODO: add unit tests for failure cases
  });

  it('should throw error for non-object listing', () => {
    expect(() => validateListing(null as any)).toThrow('Invalid listing: not an object');
    expect(() => validateListing('string' as any)).toThrow('Invalid listing: not an object');
    expect(() => validateListing(123 as any)).toThrow('Invalid listing: not an object');
  });

  it('should throw error for missing meta property', () => {
    const invalidListing = { data: [] };
    expect(() => validateListing(invalidListing as any)).toThrow('Invalid listing: meta property should be an object');
  });

  it('should throw error for invalid meta property', () => {
    const invalidListing = { meta: 'string', data: [] };
    expect(() => validateListing(invalidListing as any)).toThrow('Invalid listing: meta property should be an object');
  });

  it('should throw error for unknown meta keys', () => {
    const invalidListing = {
      meta: {
        version: 1,
        unknownKey: 'value',
      },
      data: [],
    };
    expect(() => validateListing(invalidListing as any)).toThrow(
      'Invalid listing: meta property has unknown key(s): unknownKey',
    );
  });

  it('should throw error for unsupported version', () => {
    const invalidListing = {
      meta: { version: 2 },
      data: [],
    };
    expect(() => validateListing(invalidListing as any)).toThrow('Invalid listing: unsupported version: 2');
  });

  it('should throw error for missing data property', () => {
    const invalidListing = {
      meta: { version: 1 },
    };
    expect(() => validateListing(invalidListing as any)).toThrow('Invalid listing: data property should be an array');
  });

  it('should throw error for non-array data property', () => {
    const invalidListing = {
      meta: { version: 1 },
      data: 'string',
    };
    expect(() => validateListing(invalidListing as any)).toThrow('Invalid listing: data property should be an array');
  });

  it('should throw error for invalid tokens in data', () => {
    const invalidListing = {
      meta: { version: 1 },
      data: [
        { $name: 'test', $type: 'color' }, // missing $value
        null,
        'string',
      ],
    };
    expect(() => validateListing(invalidListing as any)).toThrow(
      'Invalid listing: all items in data should be valid design tokens',
    );
  });
});

describe('diffListings', () => {
  const createBasicListing = (tokens: any[]): TokenListing => ({
    meta: {
      version: 1,
      authoringTool: 'test',
      modes: [],
      names: { web: { description: 'Web platform' }, ios: { description: 'iOS platform' } },
      sourceOfTruth: 'test',
    },
    data: tokens,
  });

  const createToken = (name: string, value: any, platform = 'web', mode = 'default') => ({
    $name: name,
    $type: 'color',
    $value: value,
    $extensions: {
      'app.terrazzo.listing': {
        names: { [platform]: name.replace('.', '-') },
        mode: mode,
      },
    },
  });

  it('should return empty diff for identical listings', () => {
    const token = createToken('color.primary', '#ff0000');
    const listing1 = createBasicListing([token]);
    const listing2 = createBasicListing([token]);

    const result = diffListings(listing1, listing2);

    expect(result).toEqual({
      meta: { version: 1 },
      data: [],
    });
  });

  it('should detect added tokens', () => {
    const oldListing = createBasicListing([]);
    const newToken = createToken('color.primary', '#ff0000');
    const newListing = createBasicListing([newToken]);

    const result = diffListings(oldListing, newListing);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      changeType: 'added',
      name: 'color.primary',
      platform: 'web',
      mode: 'default',
    });
    expect(result.data[0]?.old).toEqual({
      $extensions: null,
      $name: null,
      $type: null,
      $value: null,
    });
    expect(result.data[0]?.new?.$value).toBe('#ff0000');
  });

  it('should detect removed tokens', () => {
    const oldToken = createToken('color.primary', '#ff0000');
    const oldListing = createBasicListing([oldToken]);
    const newListing = createBasicListing([]);

    const result = diffListings(oldListing, newListing);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      changeType: 'removed',
      name: 'color.primary',
      platform: 'web',
      mode: 'default',
    });
    expect(result.data[0]?.old?.$value).toBe('#ff0000');
    expect(result.data[0]?.new).toEqual({
      $extensions: null,
      $name: null,
      $type: null,
      $value: null,
    });
  });

  it('should detect modified tokens', () => {
    const oldToken = createToken('color.primary', '#ff0000');
    const newToken = createToken('color.primary', '#00ff00');
    const oldListing = createBasicListing([oldToken]);
    const newListing = createBasicListing([newToken]);

    const result = diffListings(oldListing, newListing);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      changeType: 'modified',
      name: 'color.primary',
      platform: 'web',
      mode: 'default',
    });
    expect(result.data[0]?.old?.$value).toBe('#ff0000');
    expect(result.data[0]?.new?.$value).toBe('#00ff00');
  });

  it('should detect changes in token type', () => {
    const oldToken = {
      $name: 'test.token',
      $type: 'color',
      $value: '#ff0000',
      $extensions: {
        'app.terrazzo.listing': {
          names: { web: 'test-token' },
          mode: 'default',
        },
      },
    };
    const newToken = {
      ...oldToken,
      $type: 'dimension',
    };
    const oldListing = createBasicListing([oldToken]);
    const newListing = createBasicListing([newToken]);

    const result = diffListings(oldListing, newListing);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.old?.$type).toBe('color');
    expect(result.data[0]?.new?.$type).toBe('dimension');
  });

  it('should detect changes in token description', () => {
    const oldToken = {
      $name: 'test.token',
      $type: 'color',
      $value: '#ff0000',
      $description: 'Old description',
      $extensions: {
        'app.terrazzo.listing': {
          names: { web: 'test-token' },
          mode: 'default',
        },
      },
    };
    const newToken = {
      ...oldToken,
      $description: 'New description',
    };
    const oldListing = createBasicListing([oldToken]);
    const newListing = createBasicListing([newToken]);

    const result = diffListings(oldListing, newListing);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.old?.$description).toBe('Old description');
    expect(result.data[0]?.new?.$description).toBe('New description');
  });

  it('should detect changes in deprecation status', () => {
    const oldToken = {
      $name: 'test.token',
      $type: 'color',
      $value: '#ff0000',
      $deprecated: false,
      $extensions: {
        'app.terrazzo.listing': {
          names: { web: 'test-token' },
          mode: 'default',
        },
      },
    };
    const newToken = {
      ...oldToken,
      $deprecated: true,
    };
    const oldListing = createBasicListing([oldToken]);
    const newListing = createBasicListing([newToken]);

    const result = diffListings(oldListing, newListing);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.old?.$deprecated).toBe(false);
    expect(result.data[0]?.new?.$deprecated).toBe(true);
  });

  it('should handle multiple tokens with different platforms', () => {
    const token1 = createToken('color.primary', '#ff0000', 'web');
    const token2 = createToken('color.primary', '#ff0000', 'ios');
    const oldListing = createBasicListing([token1]);
    const newListing = createBasicListing([token1, token2]);

    const result = diffListings(oldListing, newListing);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      changeType: 'added',
      name: 'color.primary',
      platform: 'ios',
    });
  });

  it('should handle multiple tokens with different modes', () => {
    const token1 = createToken('color.primary', '#ff0000', 'web', 'light');
    const token2 = createToken('color.primary', '#ffffff', 'web', 'dark');
    const oldListing = createBasicListing([token1]);
    const newListing = createBasicListing([token1, token2]);

    const result = diffListings(oldListing, newListing);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      changeType: 'added',
      name: 'color.primary',
      platform: 'web',
      mode: 'dark',
    });
  });

  it('should sort tokens lexicographically and handle complex scenarios', () => {
    const tokenA = createToken('color.a', '#ff0000');
    const tokenB = createToken('color.b', '#00ff00');
    const tokenC = createToken('color.c', '#0000ff');

    const oldListing = createBasicListing([tokenA, tokenC]);
    const newListing = createBasicListing([tokenB, tokenC]);

    const result = diffListings(oldListing, newListing);

    expect(result.data).toHaveLength(2);
    // Should be sorted by token name
    expect(result.data[0]).toMatchObject({
      changeType: 'removed',
      name: 'color.a',
    });
    expect(result.data[1]).toMatchObject({
      changeType: 'added',
      name: 'color.b',
    });
  });

  it('should throw error for invalid uuid format', () => {
    // This test would require access to the internal computeDiffReport function
    // For now, we'll test indirectly by ensuring the diff function handles malformed data gracefully
    const malformedToken = {
      $name: '',
      $type: 'color',
      $value: '#ff0000',
      $extensions: {
        'app.terrazzo.listing': {
          names: { web: 'test' },
          mode: 'default',
        },
      },
    };

    const oldListing = createBasicListing([malformedToken]);
    const newListing = createBasicListing([]);

    expect(() => diffListings(oldListing, newListing)).toThrow('Invalid token uuid');
  });

  it('should return correct meta information', () => {
    const listing1 = createBasicListing([]);
    const listing2 = createBasicListing([]);

    const result = diffListings(listing1, listing2);

    expect(result.meta).toEqual({ version: 1 });
  });

  it('should validate both listings before processing', () => {
    const validListing = createBasicListing([]);
    const invalidListing = { meta: {}, data: [] };

    expect(() => diffListings(invalidListing as any, validListing)).toThrow();
    expect(() => diffListings(validListing, invalidListing as any)).toThrow();
  });

  it('should filter by platform', () => {
    const token1 = createToken('color.primary', '#ff0000', 'web');
    const token2 = createToken('color.primary', '#ff0000', 'ios');
    const token3 = createToken('color.secondary', '#00ff00', 'web');

    const oldListing = createBasicListing([token1, token3]);
    const newListing = createBasicListing([token1, token2, token3]);

    const result = diffListings(oldListing, newListing, { platforms: ['ios'] });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      changeType: 'added',
      name: 'color.primary',
      platform: 'ios',
    });
  });

  it('should filter by mode', () => {
    const token1 = createToken('color.primary', '#ff0000', 'web', 'light');
    const token2 = createToken('color.primary', '#ffffff', 'web', 'dark');
    const token3 = createToken('color.secondary', '#00ff00', 'web', 'light');

    const oldListing = createBasicListing([token1, token3]);
    const newListing = createBasicListing([token1, token2, token3]);

    const result = diffListings(oldListing, newListing, { modes: ['dark'] });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      changeType: 'added',
      name: 'color.primary',
      platform: 'web',
      mode: 'dark',
    });
  });

  it('should filter by multiple platforms and modes', () => {
    const token1 = createToken('color.primary', '#ff0000', 'web', 'light');
    const token2 = createToken('color.primary', '#ffffff', 'web', 'dark');
    const token3 = createToken('color.primary', '#ff0000', 'ios', 'light');
    const token4 = createToken('color.secondary', '#00ff00', 'android', 'light');

    const oldListing = createBasicListing([token1]);
    const newListing = createBasicListing([token1, token2, token3, token4]);

    const result = diffListings(oldListing, newListing, {
      platforms: ['web', 'ios'],
      modes: ['dark', 'light'],
    });

    expect(result.data).toHaveLength(2);
    expect(result.data.some((entry) => entry.platform === 'web' && entry.mode === 'dark')).toBe(true);
    expect(result.data.some((entry) => entry.platform === 'ios' && entry.mode === 'light')).toBe(true);
    expect(result.data.some((entry) => entry.platform === 'android')).toBe(false);
  });

  it('should handle "." syntax for modeless tokens in the mode filter', () => {
    const token1 = createToken('color.primary', '#ff0000', 'web', '.');
    const token2 = createToken('color.secondary', '#00ff00', 'web', 'light');

    const oldListing = createBasicListing([]);
    const newListing = createBasicListing([token1, token2]);

    const result = diffListings(oldListing, newListing, { modes: ['.'] });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      changeType: 'added',
      name: 'color.primary',
      platform: 'web',
      mode: null,
    });
  });

  it('should return DTCG-format tokens by default', () => {
    const token1 = createToken('color.primary', '#ff0000', 'web', 'light');

    const oldListing = createBasicListing([token1]);
    const newListing = createBasicListing([{ ...token1, $extensions: { ...token1.$extensions, someFlag: true } }]);

    const result = diffListings(oldListing, newListing, {});

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      new: expect.objectContaining({ $extensions: expect.objectContaining({ someFlag: true }) }),
    });
  });

  it('should return DTCG-format tokens when flat is false', () => {
    const token1 = createToken('color.primary', '#ff0000', 'web', 'light');

    const oldListing = createBasicListing([token1]);
    const newListing = createBasicListing([{ ...token1, $extensions: { ...token1.$extensions, someFlag: true } }]);

    const result = diffListings(oldListing, newListing, { flat: false });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      new: expect.objectContaining({ $extensions: expect.objectContaining({ someFlag: true }) }),
    });
  });

  it('should return flat tokens when flat is true', () => {
    const token1 = createToken('color.primary', '#ff0000', 'web', 'light');

    const oldListing = createBasicListing([token1]);
    const newListing = createBasicListing([{ ...token1, $extensions: { ...token1.$extensions, someFlag: true } }]);

    const result = diffListings(oldListing, newListing, { flat: true });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      new: expect.objectContaining({ '$extensions.someFlag': true }),
    });
  });
});
