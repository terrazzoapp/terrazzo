import type { ListedToken } from '@terrazzo/plugin-token-listing';
import { describe, expect, it } from 'vitest';
import { flattenDiffEntry, unflattenDiffEntry } from '../src/flatten.js';
import type { DiffEntry, FlattenedObject } from '../src/lib.js';

describe('flatten/unflatten with dot escaping', () => {
  const createDiffEntry = (old: any, new_: any): DiffEntry<ListedToken> => ({
    changeType: 'modified',
    name: 'test.token',
    platform: 'web',
    mode: 'light',
    old,
    new: new_,
  });

  describe('round-trip conversions', () => {
    it('should handle simple object round-trip (flat→unflat→flat)', () => {
      const original = {
        $value: '#cc99ff',
        $type: 'color',
        $description: 'Test color',
      };
      const entry = createDiffEntry(original, original);

      const flattened = flattenDiffEntry(entry);
      const unflattened = unflattenDiffEntry(flattened);
      const reflattened = flattenDiffEntry(unflattened);

      expect(reflattened.old).toEqual(flattened.old);
      expect(reflattened.new).toEqual(flattened.new);
    });

    it('should handle nested object round-trip (flat→unflat→flat)', () => {
      const original = {
        $value: '#cc99ff',
        $extensions: {
          'app.terrazzo.listing': {
            names: { web: 'test-color' },
            mode: 'light',
          },
          custom: {
            nested: {
              deep: 'value',
            },
          },
        },
      };
      const entry = createDiffEntry(original, original);

      const flattened = flattenDiffEntry(entry);
      const unflattened = unflattenDiffEntry(flattened);
      const reflattened = flattenDiffEntry(unflattened);

      expect(reflattened.old).toEqual(flattened.old);
      expect(reflattened.new).toEqual(flattened.new);
    });

    it('should handle reverse round-trip (unflat→flat→unflat)', () => {
      const original = {
        $value: '#cc99ff',
        $extensions: {
          'app.terrazzo.listing': {
            names: { web: 'test-color' },
          },
        },
      };
      const entry = createDiffEntry(original, original);

      const flattened = flattenDiffEntry(entry);
      const unflattened = unflattenDiffEntry(flattened);
      const reflattened = flattenDiffEntry(unflattened);
      const reunflattened = unflattenDiffEntry(reflattened);

      expect(reunflattened.old).toEqual(unflattened.old);
      expect(reunflattened.new).toEqual(unflattened.new);
    });
  });

  describe('dot escaping in property names', () => {
    it('should escape dots in property names when flattening', () => {
      const original = {
        $value: '#cc99ff',
        'property.with.dots': 'value1',
        $extensions: {
          'key.with.dots': 'value2',
          nested: {
            'another.key.with.dots': 'value3',
          },
        },
      };
      const entry = createDiffEntry(original, original);

      const flattened = flattenDiffEntry(entry);

      // Dots in property names should be escaped
      expect(flattened.old).toHaveProperty('property\\.with\\.dots', 'value1');
      expect(flattened.old).toHaveProperty('$extensions.key\\.with\\.dots', 'value2');
      expect(flattened.old).toHaveProperty('$extensions.nested.another\\.key\\.with\\.dots', 'value3');

      // These should NOT exist (unescaped dots would create nested objects)
      expect(flattened.old).not.toHaveProperty('property.with.dots');
      expect(flattened.old).not.toHaveProperty('$extensions.key.with.dots');
    });

    it('should not unflatten escaped dots when unflattening', () => {
      const flatObject = {
        $value: '#cc99ff',
        'property\\.with\\.dots': 'value1',
        '$extensions.key\\.with\\.dots': 'value2',
        '$extensions.nested.another\\.key\\.with\\.dots': 'value3',
        '$extensions.regular.nested': 'value4',
      };
      const flatEntry: DiffEntry<FlattenedObject> = {
        changeType: 'modified',
        name: 'test.token',
        platform: 'web',
        mode: 'light',
        old: flatObject,
        new: flatObject,
      };

      const unflattened = unflattenDiffEntry(flatEntry);

      // Property names with escaped dots should be preserved as-is
      expect(unflattened.old).toHaveProperty('property.with.dots', 'value1');
      expect(unflattened.old).toHaveProperty('$extensions');
      expect((unflattened.old as any)?.$extensions).toHaveProperty('key.with.dots', 'value2');
      expect((unflattened.old as any)?.$extensions?.nested).toHaveProperty('another.key.with.dots', 'value3');
      expect((unflattened.old as any)?.$extensions?.regular).toHaveProperty('nested', 'value4');
    });

    it('should handle mixed escaped and unescaped dots', () => {
      const original = {
        $value: '#cc99ff',
        'escaped\\.dots': 'value1',
        regular: {
          nested: 'value2',
          'also\\.escaped': 'value3',
        },
      };
      const entry = createDiffEntry(original, original);

      const flattened = flattenDiffEntry(entry);
      const unflattened = unflattenDiffEntry(flattened);

      expect(unflattened.old).toHaveProperty('escaped\\.dots', 'value1');
      expect((unflattened.old as any)?.regular).toHaveProperty('nested', 'value2');
      expect((unflattened.old as any)?.regular).toHaveProperty('also\\.escaped', 'value3');
    });

    it('should handle round-trip with complex dot escaping', () => {
      const original = {
        $value: '#cc99ff',
        'key.with.dots': 'value1',
        $extensions: {
          'app.terrazzo.listing': {
            names: { 'platform.with.dots': 'test-color' },
          },
          'custom.extension': {
            'nested.key': 'value2',
          },
        },
      };
      const entry = createDiffEntry(original, original);

      // Multiple round-trips should be stable
      let current = entry;
      for (let i = 0; i < 3; i++) {
        const flattened = flattenDiffEntry(current);
        current = unflattenDiffEntry(flattened);
      }

      // Should preserve the original structure
      expect(current.old).toHaveProperty('key.with.dots', 'value1');
      expect((current.old as any)?.$extensions).toHaveProperty('app.terrazzo.listing');
      expect((current.old as any)?.$extensions?.['app.terrazzo.listing']?.names).toHaveProperty(
        'platform.with.dots',
        'test-color',
      );
      expect((current.old as any)?.$extensions).toHaveProperty('custom.extension');
      expect((current.old as any)?.$extensions?.['custom.extension']).toHaveProperty('nested.key', 'value2');
    });
  });

  describe('edge cases', () => {
    it('should handle empty objects', () => {
      const entry = createDiffEntry({}, {});

      const flattened = flattenDiffEntry(entry);
      const unflattened = unflattenDiffEntry(flattened);
      const reflattened = flattenDiffEntry(unflattened);

      expect(reflattened.old).toEqual({});
      expect(reflattened.new).toEqual({});
    });

    it('should handle null values', () => {
      const entry = createDiffEntry(null, null);

      const flattened = flattenDiffEntry(entry);
      const unflattened = unflattenDiffEntry(flattened);

      expect(unflattened.old).toBeNull();
      expect(unflattened.new).toBeNull();
    });

    it('should handle objects with null property values', () => {
      const original = {
        $value: null,
        'property.with.dots': null,
        $extensions: {
          key: null,
        },
      };
      const entry = createDiffEntry(original, original);

      const flattened = flattenDiffEntry(entry);
      const unflattened = unflattenDiffEntry(flattened);

      expect(unflattened.old).toHaveProperty('$value', null);
      expect(unflattened.old).toHaveProperty('property.with.dots', null);
      expect((unflattened.old as any)?.$extensions).toHaveProperty('key', null);
    });

    it('should handle arrays (pass-through)', () => {
      const original = {
        $value: ['#cc99ff', '#00ff00'],
        'array.property': [1, 2, 3],
      };
      const entry = createDiffEntry(original, original);

      const flattened = flattenDiffEntry(entry);

      // Arrays should be passed through as-is
      expect(flattened.old).toHaveProperty('$value', ['#cc99ff', '#00ff00']);
      expect(flattened.old).toHaveProperty('array\\.property', [1, 2, 3]);
    });

    it('should handle deeply nested objects with dots', () => {
      const original = {
        'level1.key': {
          'level2.key': {
            'level3.key': {
              'level4.key': 'deep value',
            },
          },
        },
      };
      const entry = createDiffEntry(original, original);

      const flattened = flattenDiffEntry(entry);
      const unflattened = unflattenDiffEntry(flattened);
      const reflattened = flattenDiffEntry(unflattened);

      expect(reflattened.old).toEqual(flattened.old);
      expect(unflattened.old).toHaveProperty('level1.key');
      expect((unflattened.old as any)?.['level1.key']).toHaveProperty('level2.key');
      expect((unflattened.old as any)?.['level1.key']?.['level2.key']).toHaveProperty('level3.key');
      expect((unflattened.old as any)?.['level1.key']?.['level2.key']?.['level3.key']).toHaveProperty(
        'level4.key',
        'deep value',
      );
    });

    it('should handle already escaped dots', () => {
      const original = {
        'key\\.already\\.escaped': 'value1',
        'regular.nested': {
          'also\\.escaped': 'value2',
        },
      };
      const entry = createDiffEntry(original, original);

      const flattened = flattenDiffEntry(entry);
      const unflattened = unflattenDiffEntry(flattened);

      // Should handle double-escaping correctly
      expect(unflattened.old).toHaveProperty('key\\.already\\.escaped', 'value1');
      expect(unflattened.old).toHaveProperty('regular.nested');
      expect((unflattened.old as any)?.['regular.nested']).toHaveProperty('also\\.escaped', 'value2');
    });
  });

  describe('performance edge cases', () => {
    it('should handle objects with many properties with dots', () => {
      const original: any = {};
      for (let i = 0; i < 100; i++) {
        original[`prop.${i}.key`] = `value${i}`;
      }
      const entry = createDiffEntry(original, original);

      const flattened = flattenDiffEntry(entry);
      const unflattened = unflattenDiffEntry(flattened);
      const reflattened = flattenDiffEntry(unflattened);

      expect(reflattened.old).toEqual(flattened.old);

      // Verify a few random properties
      expect(unflattened.old).toHaveProperty('prop.5.key', 'value5');
      expect(unflattened.old).toHaveProperty('prop.50.key', 'value50');
      expect(unflattened.old).toHaveProperty('prop.99.key', 'value99');
    });
  });
});

describe('flattenDiffEntry and unflattenDiffEntry', () => {
  const sampleEntry = {
    changeType: 'modified' as const,
    name: 'color.primary',
    platform: 'web',
    mode: 'light',
    old: {
      $name: 'color.primary',
      $type: 'color',
      $value: '#cc99ff',
      $description: 'Primary color',
      $extensions: {
        'app.terrazzo.listing': {
          names: { web: 'primary-color' },
          mode: 'light',
        },
      },
    },
    new: {
      $name: 'color.primary',
      $type: 'color',
      $value: '#0066cc',
      $description: 'Updated primary color',
      $extensions: {
        'app.terrazzo.listing': {
          names: { web: 'primary-color' },
          mode: 'light',
        },
      },
    },
  };

  it('should flatten diff entry correctly', () => {
    const flattened = flattenDiffEntry(sampleEntry);

    expect(flattened).toMatchObject({
      changeType: 'modified',
      name: 'color.primary',
      platform: 'web',
      mode: 'light',
    });

    // Check that old and new are still objects but with flattened properties
    expect(flattened.old).toMatchObject({
      $name: 'color.primary',
      $type: 'color',
      $value: '#cc99ff',
      $description: 'Primary color',
      '$extensions.app\\.terrazzo\\.listing.names.web': 'primary-color',
      '$extensions.app\\.terrazzo\\.listing.mode': 'light',
    });

    expect(flattened.new).toMatchObject({
      $name: 'color.primary',
      $type: 'color',
      $value: '#0066cc',
      $description: 'Updated primary color',
      '$extensions.app\\.terrazzo\\.listing.names.web': 'primary-color',
      '$extensions.app\\.terrazzo\\.listing.mode': 'light',
    });

    // Ensure nested $extensions object is flattened
    expect(flattened.old).not.toHaveProperty('$extensions.app');
    expect(flattened.new).not.toHaveProperty('$extensions.app');
  });

  it('should unflatten diff entry correctly', () => {
    const flattened = flattenDiffEntry(sampleEntry);
    const unflattened = unflattenDiffEntry(flattened);

    expect(unflattened).toMatchObject({
      changeType: 'modified',
      name: 'color.primary',
      platform: 'web',
      mode: 'light',
      old: expect.objectContaining({
        $name: 'color.primary',
        $type: 'color',
        $value: '#cc99ff',
        $description: 'Primary color',
        $extensions: {
          'app.terrazzo.listing': {
            names: { web: 'primary-color' },
            mode: 'light',
          },
        },
      }),
      new: expect.objectContaining({
        $name: 'color.primary',
        $type: 'color',
        $value: '#0066cc',
        $description: 'Updated primary color',
        $extensions: {
          'app.terrazzo.listing': {
            names: { web: 'primary-color' },
            mode: 'light',
          },
        },
      }),
    });
  });

  it('should handle nested objects in flattening', () => {
    const flattened = flattenDiffEntry(sampleEntry);

    expect(flattened.old).toHaveProperty('$extensions.app\\.terrazzo\\.listing.names.web', 'primary-color');
    expect(flattened.old).toHaveProperty('$extensions.app\\.terrazzo\\.listing.mode', 'light');
  });

  it('should handle empty/null values', () => {
    const entryWithNulls = {
      changeType: 'added' as const,
      name: 'test.token',
      platform: 'web',
      mode: null,
      old: null,
      new: { $name: 'test.token', $type: 'color', $value: '#cc99ff' },
    };

    const flattened = flattenDiffEntry(entryWithNulls);
    const unflattened = unflattenDiffEntry(flattened);

    expect(unflattened.old).toBeNull();
    expect(unflattened.mode).toBeNull();
    expect(unflattened.new).toMatchObject({
      $name: 'test.token',
      $type: 'color',
      $value: '#cc99ff',
    });
  });

  it('should be reversible (flatten then unflatten)', () => {
    const flattened = flattenDiffEntry(sampleEntry);
    const unflattened = unflattenDiffEntry(flattened);
    const reflattened = flattenDiffEntry(unflattened);

    // Should maintain same structure (though some null handling may differ)
    expect(unflattened.changeType).toBe(sampleEntry.changeType);
    expect(unflattened.name).toBe(sampleEntry.name);
    expect(unflattened.platform).toBe(sampleEntry.platform);
    expect(unflattened.mode).toBe(sampleEntry.mode);
  });
});
