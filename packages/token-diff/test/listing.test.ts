import { describe, expect, it } from 'vitest';
import { diffTokenListings, filterByChangeType, filterByMode, filterByName, filterByPlatform, filterByTokenType } from '../src/listing.js';

import { type TokenListing } from '@terrazzo/token-tools/listing';
import type { DiffListingEntry } from '../src/types.js';


describe('diffTokenListings', () => {
  const createBasicListing = (tokens: any[]): TokenListing => ({
    meta: {
      version: 1,
      authoringTool: 'test',
      modes: [],
      platforms: { web: { description: 'Web platform' }, ios: { description: 'iOS platform' } },
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

    const result = diffTokenListings(listing1, listing2);

    expect(result).toEqual({
      meta: { version: 1 },
      data: [],
    });
  });

  it('should detect added tokens', () => {
    const oldListing = createBasicListing([]);
    const newToken = createToken('color.primary', '#ff0000');
    const newListing = createBasicListing([newToken]);

    const result = diffTokenListings(oldListing, newListing);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      changeType: 'added',
      name: 'color.primary',
      platform: 'web',
      mode: 'default',
    });
    expect(result.data[0]?.old).toEqual({});
    expect(result.data[0]?.new?.$value).toBe('#ff0000');
  });

  it('should detect removed tokens', () => {
    const oldToken = createToken('color.primary', '#ff0000');
    const oldListing = createBasicListing([oldToken]);
    const newListing = createBasicListing([]);

    const result = diffTokenListings(oldListing, newListing);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      changeType: 'removed',
      name: 'color.primary',
      platform: 'web',
      mode: 'default',
    });
    expect(result.data[0]?.old?.$value).toBe('#ff0000');
    expect(result.data[0]?.new).toEqual({});
  });

  it('should detect modified tokens', () => {
    const oldToken = createToken('color.primary', '#ff0000');
    const newToken = createToken('color.primary', '#00ff00');
    const oldListing = createBasicListing([oldToken]);
    const newListing = createBasicListing([newToken]);

    const result = diffTokenListings(oldListing, newListing);

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

    const result = diffTokenListings(oldListing, newListing);

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

    const result = diffTokenListings(oldListing, newListing);

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

    const result = diffTokenListings(oldListing, newListing);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.old?.$deprecated).toBe(false);
    expect(result.data[0]?.new?.$deprecated).toBe(true);
  });

  it('should handle multiple tokens with different platforms', () => {
    const token1 = createToken('color.primary', '#ff0000', 'web');
    const token2 = createToken('color.primary', '#ff0000', 'ios');
    const oldListing = createBasicListing([token1]);
    const newListing = createBasicListing([token1, token2]);

    const result = diffTokenListings(oldListing, newListing);

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

    const result = diffTokenListings(oldListing, newListing);

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

    const result = diffTokenListings(oldListing, newListing);

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

    expect(() => diffTokenListings(oldListing, newListing)).toThrow('Invalid token uuid');
  });

  it('should return correct meta information', () => {
    const listing1 = createBasicListing([]);
    const listing2 = createBasicListing([]);

    const result = diffTokenListings(listing1, listing2);

    expect(result.meta).toEqual({ version: 1 });
  });

  it('should validate both listings before processing', () => {
    const validListing = createBasicListing([]);
    const invalidListing = { meta: {}, data: [] };

    expect(() => diffTokenListings(invalidListing as any, validListing)).toThrow();
    expect(() => diffTokenListings(validListing, invalidListing as any)).toThrow();
  });

  it('should filter by platform', () => {
    const token1 = createToken('color.primary', '#ff0000', 'web');
    const token2 = createToken('color.primary', '#ff0000', 'ios');
    const token3 = createToken('color.secondary', '#00ff00', 'web');

    const oldListing = createBasicListing([token1, token3]);
    const newListing = createBasicListing([token1, token2, token3]);

    const result = diffTokenListings(oldListing, newListing, { platforms: ['ios'] });

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

    const result = diffTokenListings(oldListing, newListing, { modes: ['dark'] });

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

    const result = diffTokenListings(oldListing, newListing, {
      platforms: ['web', 'ios'],
      modes: ['dark', 'light'],
    });

    expect(result.data).toHaveLength(2);
    expect(result.data.some((entry: DiffListingEntry) => entry.platform === 'web' && entry.mode === 'dark')).toBe(true);
    expect(result.data.some((entry: DiffListingEntry) => entry.platform === 'ios' && entry.mode === 'light')).toBe(true);
    expect(result.data.some((entry: DiffListingEntry) => entry.platform === 'android')).toBe(false);
  });

  it('should handle "." syntax for modeless tokens in the mode filter', () => {
    const token1 = createToken('color.primary', '#ff0000', 'web', '.');
    const token2 = createToken('color.secondary', '#00ff00', 'web', 'light');

    const oldListing = createBasicListing([]);
    const newListing = createBasicListing([token1, token2]);

    const result = diffTokenListings(oldListing, newListing, { modes: ['.'] });

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

    const result = diffTokenListings(oldListing, newListing, {});

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      new: expect.objectContaining({ $extensions: expect.objectContaining({ someFlag: true }) }),
    });
  });

  it('should return DTCG-format tokens when flat is false', () => {
    const token1 = createToken('color.primary', '#ff0000', 'web', 'light');

    const oldListing = createBasicListing([token1]);
    const newListing = createBasicListing([{ ...token1, $extensions: { ...token1.$extensions, someFlag: true } }]);

    const result = diffTokenListings(oldListing, newListing, { flat: false });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      new: expect.objectContaining({ $extensions: expect.objectContaining({ someFlag: true }) }),
    });
  });

  it('should return flat tokens when flat is true', () => {
    const token1 = createToken('color.primary', '#ff0000', 'web', 'light');

    const oldListing = createBasicListing([token1]);
    const newListing = createBasicListing([{ ...token1, $extensions: { ...token1.$extensions, someFlag: true } }]);

    const result = diffTokenListings(oldListing, newListing, { flat: true });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      new: expect.objectContaining({ '$extensions.someFlag': true }),
    });
  });
});


describe('filterBy*', () => {
  const createSampleDiff = () => ({
    meta: { version: 1 as const },
    data: [
      {
        changeType: 'added' as const,
        name: 'color.primary',
        platform: 'web',
        mode: 'light',
        old: null,
        new: { $name: 'color.primary', $type: 'color', $value: '#ff0000' },
      },
      {
        changeType: 'removed' as const,
        name: 'color.secondary',
        platform: 'ios',
        mode: null,
        old: { $name: 'color.secondary', $type: 'color', $value: '#00ff00' },
        new: null,
      },
      {
        changeType: 'modified' as const,
        name: 'spacing.large',
        platform: 'web',
        mode: 'dark',
        old: { $name: 'spacing.large', $type: 'dimension', $value: '16px' },
        new: { $name: 'spacing.large', $type: 'dimension', $value: '20px' },
      },
    ],
  });

  describe('filterByChangeType', () => {
    it('should filter by single change type with string param', () => {
      const diff = createSampleDiff();
      const result = filterByChangeType(diff, 'added');

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.changeType).toBe('added');
    });

    it('should filter by single change type', () => {
      const diff = createSampleDiff();
      const result = filterByChangeType(diff, ['added']);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.changeType).toBe('added');
    });

    it('should filter by multiple change types', () => {
      const diff = createSampleDiff();
      const result = filterByChangeType(diff, ['added', 'removed']);

      expect(result.data).toHaveLength(2);
      expect(result.data.every((entry) => ['added', 'removed'].includes(entry.changeType))).toBe(true);
    });
  });

  describe('filterByPlatform', () => {
    it('should filter by single platform with string parameter', () => {
      const diff = createSampleDiff();
      const result = filterByPlatform(diff, 'web');

      expect(result.data).toHaveLength(2);
      expect(result.data.every((entry) => entry.platform === 'web')).toBe(true);
    });

    it('should filter by single platform', () => {
      const diff = createSampleDiff();
      const result = filterByPlatform(diff, ['web']);

      expect(result.data).toHaveLength(2);
      expect(result.data.every((entry) => entry.platform === 'web')).toBe(true);
    });

    it('should filter by multiple platforms', () => {
      const diff = createSampleDiff();
      const result = filterByPlatform(diff, ['web', 'ios']);

      expect(result.data).toHaveLength(3);
    });
  });

  describe('filterByMode', () => {
    it('should filter by single mode with string param', () => {
      const diff = createSampleDiff();
      const result = filterByMode(diff, 'light');

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.mode).toBe('light');
    });

    it('should filter by single mode', () => {
      const diff = createSampleDiff();
      const result = filterByMode(diff, ['light']);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.mode).toBe('light');
    });

    it('should filter modeless tokens when null is passed', () => {
      const diff = createSampleDiff();
      const result = filterByMode(diff, [null]);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.mode).toBeNull();
    });

    it("should filter modeless tokens when '.' is passed", () => {
      const diff = createSampleDiff();
      const result = filterByMode(diff, ['.']);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.mode).toBeNull();
    });

    it('should filter by multiple modes', () => {
      const diff = createSampleDiff();
      const result = filterByMode(diff, ['light', 'dark']);

      expect(result.data).toHaveLength(2);
      expect(result.data.every((entry) => entry.mode === 'light' || entry.mode === 'dark')).toBe(true);
    });

    it('should filter by multiple modes including null', () => {
      const diff = createSampleDiff();
      const result = filterByMode(diff, ['light', null]);

      expect(result.data).toHaveLength(2);
      expect(result.data.every((entry) => entry.mode === 'light' || entry.mode === null)).toBe(true);
    });
  });

  describe('filterByTokenType', () => {
    it('should filter by single token type with string param', () => {
      const diff = createSampleDiff();
      const result = filterByTokenType(diff, 'color');

      expect(result.data).toHaveLength(2);
      expect(result.data.every((entry) => entry.old?.$type === 'color' || entry.new?.$type === 'color')).toBe(true);
    });

    it('should filter by single token type', () => {
      const diff = createSampleDiff();
      const result = filterByTokenType(diff, ['color']);

      expect(result.data).toHaveLength(2);
      expect(result.data.every((entry) => entry.old?.$type === 'color' || entry.new?.$type === 'color')).toBe(true);
    });

    it('should filter by multiple token types', () => {
      const diff = createSampleDiff();
      const result = filterByTokenType(diff, ['color', 'dimension']);

      expect(result.data).toHaveLength(3);
    });
  });

  describe('filterByName', () => {
    it('should filter by exact name match with single string', () => {
      const diff = createSampleDiff();
      const result = filterByName(diff, 'color.primary');

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.name).toBe('color.primary');
    });

    it('should filter by exact name match with array', () => {
      const diff = createSampleDiff();
      const result = filterByName(diff, ['color.primary']);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.name).toBe('color.primary');
    });

    it('should filter by multiple exact names', () => {
      const diff = createSampleDiff();
      const result = filterByName(diff, ['color.primary', 'spacing.large']);

      expect(result.data).toHaveLength(2);
      expect(result.data.every((entry) => ['color.primary', 'spacing.large'].includes(entry.name))).toBe(true);
    });

    it('should filter by regex pattern', () => {
      const diff = createSampleDiff();
      const result = filterByName(diff, /primary|large/);

      expect(result.data).toHaveLength(2);
      expect(result.data.every((entry) => /primary|large/.test(entry.name))).toBe(true);
    });

    it('should return empty for non-matching regex pattern', () => {
      const diff = createSampleDiff();
      const result = filterByName(diff, /typography/);

      expect(result.data).toHaveLength(0);
    });
  });

  describe('misc', () => {
    it('should preserve meta information in all filter functions', () => {
      const diff = createSampleDiff();

      expect(filterByChangeType(diff, ['added']).meta).toEqual({ version: 1 });
      expect(filterByPlatform(diff, ['web']).meta).toEqual({ version: 1 });
      expect(filterByMode(diff, ['light']).meta).toEqual({ version: 1 });
      expect(filterByTokenType(diff, ['color']).meta).toEqual({ version: 1 });
      expect(filterByName(diff, ['color.primary']).meta).toEqual({ version: 1 });
      expect(filterByName(diff, 'color.').meta).toEqual({ version: 1 });
      expect(filterByName(diff, /primary/).meta).toEqual({ version: 1 });
    });
  });
});
