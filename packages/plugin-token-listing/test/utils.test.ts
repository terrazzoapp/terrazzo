import type { Logger, TokenNormalized } from '@terrazzo/parser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computePreviewValue } from '../src/utils/previewValue.js';
import { mapValues } from '../src/utils/utils.js';

describe('mapValues', () => {
  it('maps values and preserves keys', () => {
    const input = { a: 1, b: 2, c: 3 };
    const out = mapValues(input, (v) => v * 2);
    expect(out).toEqual({ a: 2, b: 4, c: 6 });
  });

  it('works with empty object', () => {
    const input: Record<string, number> = {};
    const out = mapValues(input, (v) => v + 1);
    expect(out).toEqual({});
  });

  it('passes key to mapper', () => {
    const input = { x: 'one', y: 'two' };
    const out = mapValues(input, (v, k) => `${k}:${v}`);
    expect(out).toEqual({ x: 'x:one', y: 'y:two' });
  });
});

vi.mock('@terrazzo/token-tools/css', () => ({
  transformCSSValue: vi.fn(),
}));

describe('computePreviewValue', () => {
  const mockLogger: Logger = {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    level: 'info' as const,
    debugScope: '',
    errorCount: 0,
    warnCount: 0,
    infoCount: 0,
    debugCount: 0,
    setLevel: vi.fn(),
    stats: vi.fn(),
  };

  const createMockToken = (
    id: string,
    $type: any = 'color',
    mode: any = { '.': { $value: 'test-value' } },
  ): TokenNormalized =>
    ({
      id,
      $type,
      mode,
      $description: undefined,
      $extensions: undefined,
      aliasOf: undefined,
    }) as TokenNormalized;

  const mockTokensSet: Record<string, TokenNormalized> = {
    'color.primary': createMockToken('color.primary', 'color'),
    'typography.heading': createMockToken('typography.heading', 'typography'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic token transformation', () => {
    it('returns string value from transformCSSValue', async () => {
      const { transformCSSValue } = await import('@terrazzo/token-tools/css');
      vi.mocked(transformCSSValue).mockReturnValue('#ff0000');

      const token = createMockToken('color.red', 'color');
      const result = computePreviewValue({
        tokensSet: mockTokensSet,
        token,
        logger: mockLogger,
      });

      expect(result).toBe('#ff0000');
    });

    it.skip('returns empty string when transformCSSValue returns ""', async () => {
      const { transformCSSValue } = await import('@terrazzo/token-tools/css');
      vi.mocked(transformCSSValue).mockReturnValue('');

      const token = createMockToken('test.token', 'color');
      const result = computePreviewValue({
        tokensSet: mockTokensSet,
        token,
        logger: mockLogger,
      });

      expect(result).toBe('');
    });
  });

  describe('typography tokens', () => {
    it('formats complete typography object correctly', async () => {
      const { transformCSSValue } = await import('@terrazzo/token-tools/css');
      vi.mocked(transformCSSValue).mockReturnValue({
        'font-family': 'Arial, sans-serif',
        'font-size': '16px',
        'font-weight': '600',
        'font-style': 'italic',
        'line-height': '1.5',
      });

      const token = createMockToken('typography.heading', 'typography');
      const result = computePreviewValue({
        tokensSet: mockTokensSet,
        token,
        logger: mockLogger,
      });

      expect(result).toBe('600 italic 16px/1.5 Arial, sans-serif');
    });

    it('skips missing optional font properties', async () => {
      const { transformCSSValue } = await import('@terrazzo/token-tools/css');
      vi.mocked(transformCSSValue).mockReturnValue({
        'font-family': 'serif',
        'font-size': '1rem',
      });

      const token = createMockToken('typography.minimal', 'typography');
      const result = computePreviewValue({
        tokensSet: mockTokensSet,
        token,
        logger: mockLogger,
      });

      expect(result).toBe('1rem serif');
    });

    it('throws a warning for typography tokens without a font-family', async () => {
      const { transformCSSValue } = await import('@terrazzo/token-tools/css');
      vi.mocked(transformCSSValue).mockReturnValue({
        'font-size': '1rem',
        'font-weight': 'bold',
      });

      const token = createMockToken('typography.weight-only', 'typography');
      const result = computePreviewValue({
        tokensSet: mockTokensSet,
        token,
        logger: mockLogger,
      });

      expect(mockLogger.warn).toHaveBeenCalledWith({
        group: 'plugin',
        label: '@terrazzo/plugin-token-listing > build > typography.weight-only',
        message: `Composite typography token 'typography.weight-only' is missing a font-family or font-size, so a preview value cannot be computed`,
      });

      expect(result).toBe('');
    });

    it('throws a warning for typography tokens without a font-size', async () => {
      const { transformCSSValue } = await import('@terrazzo/token-tools/css');
      vi.mocked(transformCSSValue).mockReturnValue({
        'font-family': 'Helvetica, sans-serif',
        'font-weight': 'bold',
      });

      const token = createMockToken('typography.weight-only', 'typography');
      const result = computePreviewValue({
        tokensSet: mockTokensSet,
        token,
        logger: mockLogger,
      });

      expect(mockLogger.warn).toHaveBeenCalledWith({
        group: 'plugin',
        label: '@terrazzo/plugin-token-listing > build > typography.weight-only',
        message: `Composite typography token 'typography.weight-only' is missing a font-family or font-size, so a preview value cannot be computed`,
      });

      expect(result).toBe('');
    });
  });

  describe('mode handling', () => {
    // Note: this test was disabled because this is testing APIs of token-tools from within plugin-token-listing.
    // The signature changed, so { mode: 'dark' } is no longer a valid param.
    // FIXME: change this test to only care about this plugin, not the implementation details of another package.
    it.skip('uses specified mode when available in token', async () => {
      const { transformCSSValue } = await import('@terrazzo/token-tools/css');
      vi.mocked(transformCSSValue).mockReturnValue('#dark-color');

      const token = createMockToken('color.adaptive', 'color', {
        '.': { $value: '#light-color' },
        dark: { $value: '#dark-color' },
      });

      computePreviewValue({
        tokensSet: mockTokensSet,
        token,
        mode: 'dark',
        logger: mockLogger,
      });

      expect(transformCSSValue).toHaveBeenCalledWith(token, expect.objectContaining({ mode: 'dark' }));
    });

    // Note: this test was disabled because this is testing APIs of token-tools from within plugin-token-listing.
    // The signature changed, so { mode: '.' } is no longer a valid param.
    // FIXME: change this test to only care about this plugin, not the implementation details of another package.
    it.skip('falls back to default mode when specified mode not available', async () => {
      const { transformCSSValue } = await import('@terrazzo/token-tools/css');
      vi.mocked(transformCSSValue).mockReturnValue('#default-color');

      const token = createMockToken('color.no-dark-mode', 'color');

      computePreviewValue({
        tokensSet: mockTokensSet,
        token,
        mode: 'dark',
        logger: mockLogger,
      });

      expect(transformCSSValue).toHaveBeenCalledWith(token, expect.objectContaining({ mode: '.' }));
    });

    // Note: this test was disabled because this is testing APIs of token-tools from within plugin-token-listing.
    // The signature changed, so { mode: '.' } is no longer a valid param.
    // FIXME: change this test to only care about this plugin, not the implementation details of another package.
    it.skip('uses default mode when no mode specified', async () => {
      const { transformCSSValue } = await import('@terrazzo/token-tools/css');
      vi.mocked(transformCSSValue).mockReturnValue('#default-color');

      const token = createMockToken('color.default', 'color');

      computePreviewValue({
        tokensSet: mockTokensSet,
        token,
        logger: mockLogger,
      });

      expect(transformCSSValue).toHaveBeenCalledWith(token, expect.objectContaining({ mode: '.' }));
    });
  });

  describe('unsupported object handling', () => {
    it('logs warning and returns empty string for unsupported objects', async () => {
      const { transformCSSValue } = await import('@terrazzo/token-tools/css');
      const unsupportedObject = { 'custom-property': 'value', 'another-prop': 'test' };
      vi.mocked(transformCSSValue).mockReturnValue(unsupportedObject);

      const token = createMockToken('custom.token', 'custom');
      const result = computePreviewValue({
        tokensSet: mockTokensSet,
        token,
        logger: mockLogger,
      });

      expect(result).toBe('');
      expect(mockLogger.warn).toHaveBeenCalledWith({
        group: 'plugin',
        label: '@terrazzo/plugin-token-listing > build > custom.token',
        message: `Preview value computation is not supported yet for: ${JSON.stringify(unsupportedObject)}`,
      });
    });

    it('handles non-typography object types', async () => {
      const { transformCSSValue } = await import('@terrazzo/token-tools/css');
      const shadowObject = { 'box-shadow': '0 2px 4px rgba(0,0,0,0.1)' };
      vi.mocked(transformCSSValue).mockReturnValue(shadowObject);

      const token = createMockToken('shadow.subtle', 'shadow');
      const result = computePreviewValue({
        tokensSet: mockTokensSet,
        token,
        logger: mockLogger,
      });

      expect(result).toBe('');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Preview value computation is not supported yet for:'),
        }),
      );
    });
  });

  describe('alias resolution', () => {
    it('calls transformCSSValue with recursive alias transformer', async () => {
      const { transformCSSValue } = await import('@terrazzo/token-tools/css');
      vi.mocked(transformCSSValue).mockReturnValue('#resolved-color');

      const token = createMockToken('color.alias', 'color');

      computePreviewValue({
        tokensSet: mockTokensSet,
        token,
        logger: mockLogger,
      });

      expect(transformCSSValue).toHaveBeenCalledWith(
        token,
        expect.objectContaining({
          transformAlias: expect.any(Function),
          tokensSet: mockTokensSet,
          color: { legacyHex: true },
        }),
      );
    });

    // Note: this test was disabled because this is testing APIs of token-tools from within plugin-token-listing.
    // The signature changed, so { mode: 'light' } is no longer a valid param.
    // FIXME: change this test to only care about this plugin, not the implementation details of another package.
    it.skip('passes correct parameters to transformCSSValue', async () => {
      const { transformCSSValue } = await import('@terrazzo/token-tools/css');
      vi.mocked(transformCSSValue).mockReturnValue('#test-color');

      const token = createMockToken('color.test', 'color', {
        '.': { $value: '#000' },
        light: { $value: '#000' },
        dark: { $value: '#fff' },
      });

      computePreviewValue({
        tokensSet: mockTokensSet,
        token,
        mode: 'light',
        logger: mockLogger,
      });

      expect(transformCSSValue).toHaveBeenCalledWith(token, {
        mode: 'light',
        tokensSet: mockTokensSet,
        transformAlias: expect.any(Function),
        color: { legacyHex: true },
      });
    });
  });

  describe('edge cases', () => {
    it('handles empty tokensSet', async () => {
      const { transformCSSValue } = await import('@terrazzo/token-tools/css');
      vi.mocked(transformCSSValue).mockReturnValue('#color');

      const token = createMockToken('isolated.token', 'color');
      const result = computePreviewValue({
        tokensSet: {},
        token,
        logger: mockLogger,
      });

      expect(result).toBe('#color');
    });

    // Note: this test was disabled because this is testing APIs of token-tools from within plugin-token-listing.
    // The signature changed, so { mode: 'nonexistant' } is no longer a valid param.
    // FIXME: change this test to only care about this plugin, not the implementation details of another package.
    it.skip('handles token with empty mode object', async () => {
      const { transformCSSValue } = await import('@terrazzo/token-tools/css');
      vi.mocked(transformCSSValue).mockReturnValue('#fallback');

      const token = createMockToken('token.empty-mode', 'color', {});

      computePreviewValue({
        tokensSet: mockTokensSet,
        token,
        mode: 'nonexistent',
        logger: mockLogger,
      });

      expect(transformCSSValue).toHaveBeenCalledWith(token, expect.objectContaining({ mode: '.' }));
    });
  });

  describe('WideGamutColorValue', () => {
    it('formats WideGamutColorValue correctly for preview', async () => {
      const { transformCSSValue } = await import('@terrazzo/token-tools/css');
      vi.mocked(transformCSSValue).mockReturnValue({
        '.': 'color(display-p3 0.5 0.2 0.7)',
        srgb: 'rgb(128, 51, 179)',
        p3: 'color(display-p3 0.5 0.2 0.7)',
        rec2020: 'color(rec2020 0.5 0.2 0.7)',
      });

      const token = {
        id: 'color.wide-gamut',
        $type: 'color',
        mode: { '.': { $value: 'irrelevant' } },
        $description: undefined,
        $extensions: undefined,
        aliasOf: undefined,
      } as any;

      const result = computePreviewValue({
        tokensSet: {},
        token,
        logger: mockLogger,
      });

      expect(result).toBe('rgb(128, 51, 179)');
    });
  });
});
