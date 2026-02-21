import { describe, expect, it } from 'vitest';
import { parseTzAtRule, parseTzAtRules } from '../src/lib.js';

describe('parseTzAtRules', () => {
  it('simple', () => {
    expect(
      parseTzAtRules(`@import "tailwindcss";

/* Default theme */
@theme {
  @tz (theme: "light");
}

/* Uncomment to change conditions for dark mode */
/* @custom-variant dark ([data-theme="dark"]); */

/* Dark mode (@see https://tailwindcss.com/docs/dark-mode) */
@variant dark {
  @tz (theme: "dark");
}

/* Custom variant: light-high-contrast (shortened to "light-hc" in Tailwind) */
@custom-variant light-hc ([data-theme="light-hc"]);

@variant light-hc {
  @tz (theme: "light-high-contrast");
}

/* Custom variant: dark-high-contrast (shortened to "dark-hc" in Tailwind) */
@custom-variant dark-hc ([data-theme="dark-hc"]);

@variant dark-hc {
  @tz (theme: "dark-high-contrast");
}

/* Custom variant for reduced motion */
@custom-variant reduced-motion (@media (prefers-reduced-motion: reduce));

@variant reduced-motion {
  @tz (motion: "reduced");
}

/* Custom CSS is allowed */
.my-custom-util {
  color: red;
}`),
    ).toEqual([
      { start: 55, end: 76, input: { theme: 'light' } },
      { start: 262, end: 282, input: { theme: 'dark' } },
      { start: 441, end: 476, input: { theme: 'light-high-contrast' } },
      { start: 630, end: 664, input: { theme: 'dark-high-contrast' } },
      { start: 811, end: 835, input: { motion: 'reduced' } },
    ]);
  });
});

describe('parseTzAtRule', () => {
  it('empty', () => {
    expect(
      parseTzAtRule(`@theme {
  @tz;
}`),
    ).toEqual({ start: 11, end: 15, input: {} });
  });
  it('empty, no semicolon', () => {
    expect(
      parseTzAtRule(`@theme {
  @tz
}`),
      // Note: end is 15, because we need the "}" character
    ).toEqual({ start: 11, end: 16, input: {} });
  });
  it('empty with parens', () => {
    expect(
      parseTzAtRule(`@custom-variant light-hc ([data-theme="light-hc"]);

@variant light-hc {
  @tz();
}`),
    ).toEqual({ start: 75, end: 81, input: {} });
  });
  it('single modifier', () => {
    expect(parseTzAtRule('@tz(theme: "dark")')).toEqual({ start: 0, end: 18, input: { theme: 'dark' } });
  });
  it('single modifier with line breaks', () => {
    expect(parseTzAtRule('@tz\n\n(theme:\n\n"dark"\n\n)\n\n')).toEqual({ start: 0, end: 25, input: { theme: 'dark' } });
  });
  it('multiple modifiers', () => {
    expect(parseTzAtRule('@tz(theme: "dark", motion: "reduced", text-size: "small")')).toEqual({
      start: 0,
      end: 57,
      input: {
        theme: 'dark',
        motion: 'reduced',
        'text-size': 'small',
      },
    });
  });
  it('no @tz', () => {
    expect(parseTzAtRule('.foo { color: blue }')).toBeUndefined();
  });
  it('comment inside', () => {
    expect(parseTzAtRule('@tz(theme: "dark", /* motion: "reduced" */, /* ) */ text-size: "small")')).toEqual({
      start: 0,
      end: 71,
      input: {
        theme: 'dark',
        'text-size': 'small',
      },
    });
  });
  it('comment outside', () => {
    expect(parseTzAtRule('/* @tz(theme: light); */')).toBeUndefined();
  });
  it('unrelated at-rule', () => {
    expect(parseTzAtRule('@tzap(theme: light);')).toBeUndefined();
  });
  it('errs on invalid syntax', () => {
    expect(() => parseTzAtRule('@tz(theme: dark-hc)')).toThrowError(
      'Invalid syntax: @tz(theme: dark-hc). Expected @tz(modifier1: "value", modifier2: "value", …).',
    );
    expect(() => parseTzAtRule('@tz("theme": dark-hc)')).toThrowError(
      'Invalid syntax: @tz("theme": dark-hc). Expected @tz(modifier1: "value", modifier2: "value", …).',
    );
    expect(() => parseTzAtRule('@tz(theme dark-hc)')).toThrowError(
      'Invalid syntax: @tz(theme dark-hc). Expected @tz(modifier1: "value", modifier2: "value", …).',
    );
    expect(() => parseTzAtRule('@tz theme: dark-hc;')).toThrowError(
      'Invalid syntax: @tz theme: dark-hc;. Expected @tz(modifier1: "value", modifier2: "value", …).',
    );
  });
});
