import { describe, expect, test } from 'vitest';
import { token } from './types/index.js';

describe('TypeScript types', () => {
  // note: the type tests rely on unique prototype methods of specific types
  // that TS wouldn’t allow if it was an unknown type
  describe('token type', () => {
    test('color', () => {
      expect(token('color.blue').toLowerCase()).toBe('#218bff');
    });

    test('dimension', () => {
      expect(token('spacing.md').toLowerCase()).toBe('16px');
    });

    test('duration', () => {
      expect(token('transition.moderate01').toLowerCase()).toBe('150ms');
    });

    test('link', () => {
      expect(token('icon.3D-Cursor').toLowerCase()).toBe('/icon/3d-cursor.svg');
    });

    test('cubicBezier', () => {
      expect(token('easing.easeOut').map((v) => v)).toEqual([0, 0, 0.25, 1]);
    });

    test('fontFamily', () => {
      expect(token('font.family.sans').map((v) => v)).toEqual([
        'IBM Plex Sans',
        'Helvetica Neue',
        'Arial',
        'sans-serif',
      ]);
    });
  });

  describe('mode', () => {
    test('color + mode', () => {
      expect(token('color.red', 'dark').toLowerCase()).toBe('#da3633');
    });
  });
});
