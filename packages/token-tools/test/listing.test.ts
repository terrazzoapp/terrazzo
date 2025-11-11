import { describe, expect, it } from 'vitest';
import { validateListing, type TokenListing } from '../src/listing.js';


describe('validateListing', () => {
  it('should validate a valid listing', () => {
    const validListing: TokenListing = {
      meta: {
        version: 1,
        authoringTool: 'test',
        modes: [],
        platforms: {},
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
        // missing $value
        { $name: 'test', $type: 'color' },
        null,
        'string',
      ],
    };
    expect(() => validateListing(invalidListing as any)).toThrow(
      'Invalid listing: all items in data should be valid design tokens',
    );
  });
});
