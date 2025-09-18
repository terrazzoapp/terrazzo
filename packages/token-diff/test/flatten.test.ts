import type { ListedToken } from '@terrazzo/plugin-token-listing';
import { describe, expect, it } from 'vitest';
import { flattenDiffEntry } from '../src/flatten.js';
import type { DiffEntry } from '../src/lib.js';

describe('flattenDiffEntry', () => {
  const sampleEntry: DiffEntry<ListedToken> = {
    changeType: 'modified',
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

  const createDiffEntry = (old: any, new_: any): DiffEntry<ListedToken> => ({
    changeType: 'modified',
    name: 'test.token',
    platform: 'web',
    mode: 'light',
    old,
    new: new_,
  });

  describe('general functionality', () => {
    it('should preserve non-token diff entry data', () => {
      const flattened = flattenDiffEntry(sampleEntry);

      expect(flattened).toMatchObject({
        changeType: 'modified',
        name: 'color.primary',
        platform: 'web',
        mode: 'light',
      });
    });

    it('should flatten token props', () => {
      const flattened = flattenDiffEntry(sampleEntry);

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
    });

    it('should not contain intermerdiary props in flattened tokens', () => {
      const flattened = flattenDiffEntry(sampleEntry);

      expect(flattened.old).not.toHaveProperty('$extensions');
      expect(flattened.new).not.toHaveProperty('$extensions');
      expect(flattened.old).not.toHaveProperty('$extensions.app\\.terrazzo\\.listing');
      expect(flattened.new).not.toHaveProperty('$extensions.app\\.terrazzo\\.listing');
    });

    it('should handle nested objects in flattening', () => {
      const flattened = flattenDiffEntry(sampleEntry);

      expect(flattened.old).toHaveProperty('$extensions.app\\.terrazzo\\.listing.names.web', 'primary-color');
      expect(flattened.old).toHaveProperty('$extensions.app\\.terrazzo\\.listing.mode', 'light');
      expect(flattened.old).not.toHaveProperty('$extensions.app');
      expect(flattened.old).not.toHaveProperty('$extensions.app.terrazzo');
      expect(flattened.old).not.toHaveProperty('$extensions.app\\.terrazzo');
      expect(flattened.old).not.toHaveProperty('$extensions.app.terrazzo.listing');
      expect(flattened.old).not.toHaveProperty('$extensions.app\\.terrazzo\\.listing');
    });
  });

  describe('nested props edge cases', () => {
    const shallowToken = {
      $type: 'color',
      $value: '#cc99ff',
      $extensions: {
        sharedKey: 'shallow',
        oldKey: 'value',
      },
    };
    const deepToken = {
      $type: 'color',
      $value: '#cc99ff',
      $extensions: {
        sharedKey: { extraLayer: 'deeper' },
        newKey: { subKey: 'value' },
      },
    };

    it('should contain the same props on both flattened tokens', () => {
      const entry = createDiffEntry(shallowToken, deepToken);
      const flattened = flattenDiffEntry(entry);
      expect(flattened.old).not.toBeNull();
      expect(flattened.new).not.toBeNull();
      expect(Object.keys(flattened.old!)).toMatchObject(Object.keys(flattened.new!));
    });

    it('should not contain object props from children when either is unset', () => {
      const entry = createDiffEntry(shallowToken, deepToken);
      const flattened = flattenDiffEntry(entry);
      expect(flattened.old).not.toHaveProperty('$extensions.newKey', null);
      expect(flattened.new).not.toHaveProperty('$extensions.newKey', null);
    });

    it('should not contain object props from children when both are set and both are objects', () => {
      const entry = createDiffEntry(shallowToken, deepToken);
      const flattened = flattenDiffEntry(entry);
      expect(flattened.old).not.toHaveProperty('$extensions', null);
      expect(flattened.new).not.toHaveProperty('$extensions', null);
    });

    it('should handle completely missing objects by creating null properties', () => {
      const oldToken = {
        $type: 'color',
        missing: { deep: { nested: { structure: 'value', withSeveralProps: 'value' } } },
      };
      const newToken = {
        $type: 'color',
      };
      const entry = createDiffEntry(oldToken, newToken);
      const flattened = flattenDiffEntry(entry);

      expect(flattened.old).not.toBeNull();
      expect(flattened.new).not.toBeNull();
      expect(Object.keys(flattened.old!)).toEqual(Object.keys(flattened.new!));
      expect(flattened.old!).toHaveProperty('missing.deep.nested.structure', 'value');
      expect(flattened.new!).toHaveProperty('missing.deep.nested.structure', null);
      expect(flattened.old!).toHaveProperty('missing.deep.nested.withSeveralProps', 'value');
      expect(flattened.new!).toHaveProperty('missing.deep.nested.withSeveralProps', null);
    });

    it('should contain object props when both are set in tokens but have different depths', () => {
      const entry = createDiffEntry(shallowToken, deepToken);
      const flattened = flattenDiffEntry(entry);

      expect(flattened.old).not.toHaveProperty('$extensions.sharedKey.extraLayer');
      expect(flattened.new).not.toHaveProperty('$extensions.sharedKey.extraLayer');
      expect(flattened.old).toHaveProperty('$extensions.sharedKey', 'shallow');
      expect(flattened.new).toHaveProperty(
        '$extensions.sharedKey',
        expect.objectContaining({
          extraLayer: 'deeper',
        }),
      );
    });
  });

  describe('input edge cases', () => {
    it('should escape dots in property names when flattening', () => {
      const token = {
        $type: 'color',
        $value: '#cc99ff',
        'property.with.dots': 'value1',
        $extensions: {
          'key.with.dots': 'value2',
          nested: {
            'another.key.with.dots': 'value3',
          },
        },
      };
      const entry = createDiffEntry(token, token);
      const flattened = flattenDiffEntry(entry);

      // Dots in property names should be escaped
      expect(flattened.old).toHaveProperty('property\\.with\\.dots', 'value1');
      expect(flattened.old).toHaveProperty('$extensions.key\\.with\\.dots', 'value2');
      expect(flattened.old).toHaveProperty('$extensions.nested.another\\.key\\.with\\.dots', 'value3');

      // These should NOT exist (unescaped dots would create nested objects)
      expect(flattened.old).not.toHaveProperty('property.with.dots');
      expect(flattened.old).not.toHaveProperty('$extensions.key.with.dots');
    });

    it('should handle empty objects', () => {
      const entry = createDiffEntry({}, {});
      const flattened = flattenDiffEntry(entry);

      expect(flattened.old).toEqual({});
      expect(flattened.new).toEqual({});
    });

    it('should handle null values', () => {
      const entry = createDiffEntry(null, null);
      const flattened = flattenDiffEntry(entry);

      expect(flattened.old).toBeNull();
      expect(flattened.new).toBeNull();
    });

    it('should handle null old tokens', () => {
      const token = {
        $type: 'color',
        $value: '#cc99ff',
      };
      const entry = createDiffEntry(null, token);
      const flattened = flattenDiffEntry(entry);

      expect(flattened.old).not.toBeNull();
      expect(flattened.old).toHaveProperty('$type', null);
      expect(flattened.old).toHaveProperty('$value', null);
      expect(flattened.new).not.toBeNull();
      expect(flattened.new).toHaveProperty('$type', 'color');
      expect(flattened.new).toHaveProperty('$value', '#cc99ff');
    });

    it('should handle null new tokens', () => {
      const token = {
        $type: 'color',
        $value: '#cc99ff',
      };
      const entry = createDiffEntry(token, null);
      const flattened = flattenDiffEntry(entry);

      expect(flattened.old).not.toBeNull();
      expect(flattened.old).toHaveProperty('$type', 'color');
      expect(flattened.old).toHaveProperty('$value', '#cc99ff');
      expect(flattened.new).not.toBeNull();
      expect(flattened.new).toHaveProperty('$type', null);
      expect(flattened.new).toHaveProperty('$value', null);
    });

    it('should handle arrays', () => {
      const oldToken = {
        $value: '#cc99ff',
        'array.property': [1, 2, 3],
      };
      const newToken = {
        $value: '#cc99ff',
        'array.property': [3, 4, 5],
      };
      const entry = createDiffEntry(oldToken, newToken);
      const flattened = flattenDiffEntry(entry);

      expect(flattened.old).toHaveProperty('array\\.property', [1, 2, 3]);
      expect(flattened.new).toHaveProperty('array\\.property', [3, 4, 5]);
    });
  });
});
