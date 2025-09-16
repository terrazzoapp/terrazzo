import { describe, expect, it } from 'vitest';
import { filterByChangeType, filterByMode, filterByName, filterByPlatform, filterByTokenType } from '../src/filter.js';

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
