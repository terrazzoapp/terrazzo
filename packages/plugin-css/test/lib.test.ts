import { describe, expect, it } from 'vitest';
import { type CSSRule, printRules } from '../src/lib.js';

describe('printRules', () => {
  it('basic', () => {
    expect(
      printRules([
        {
          selectors: [':root'],
          declarations: {
            '--color-blue-6': { value: '#acd8fc' },
            '--color-blue-7': { value: '#8ec8f6' },
            '--color-blue-8': { value: '#5eb1ef' },
          },
        },
        {
          selectors: ['@media (prefers-color-scheme: light)', '[data-color-mode="light"]', '.color-mode-light'],
          declarations: {
            '--color-blue-6': { value: '#acd8fc' },
            '--color-blue-7': { value: '#8ec8f6' },
            '--color-blue-8': { value: '#5eb1ef' },
          },
        },
        {
          selectors: ['@media (prefers-color-scheme: dark)', '[data-color-mode="dark"]', '.color-mode-dark'],
          declarations: {
            '--color-blue-6': { value: '#104d87' },
            '--color-blue-7': { value: '#205d9e' },
            '--color-blue-8': { value: '#2870bd' },
          },
        },
        {
          selectors: ['.font-default'],
          declarations: {
            'font-family': { value: 'var(--typography-default-font-family)' },
            'font-size': { value: 'var(--typography-default-font-size)' },
            'font-weight': { value: 'var(--typography-default-font-weight)' },
            'line-height': { value: 'var(--typography-default-line-height)' },
          },
        },
      ]),
    ).toMatchInlineSnapshot(`
      ":root {
        --color-blue-6: #acd8fc;
        --color-blue-7: #8ec8f6;
        --color-blue-8: #5eb1ef;
      }

      @media (prefers-color-scheme: light) {
        :root {
          --color-blue-6: #acd8fc;
          --color-blue-7: #8ec8f6;
          --color-blue-8: #5eb1ef;
        }
      }

      [data-color-mode="light"],
      .color-mode-light {
        --color-blue-6: #acd8fc;
        --color-blue-7: #8ec8f6;
        --color-blue-8: #5eb1ef;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --color-blue-6: #104d87;
          --color-blue-7: #205d9e;
          --color-blue-8: #2870bd;
        }
      }

      [data-color-mode="dark"],
      .color-mode-dark {
        --color-blue-6: #104d87;
        --color-blue-7: #205d9e;
        --color-blue-8: #2870bd;
      }

      .font-default {
        font-family: var(--typography-default-font-family);
        font-size: var(--typography-default-font-size);
        font-weight: var(--typography-default-font-weight);
        line-height: var(--typography-default-line-height);
      }"
    `);
  });

  it('nestedQuery', () => {
    const rules: CSSRule[] = [
      {
        selectors: ['@media (prefers-color-scheme: light)', '[data-color-mode="light"]', '.color-mode-light'],
        nestedQuery: '@media (color-gamut: p3)',
        declarations: {
          '--color-blue-6': { value: 'color(display-p3 0.062745 0.301961 0.529412)' },
          '--color-blue-7': { value: 'color(display-p3 0.12549 0.364706 0.619608)' },
          '--color-blue-8': { value: 'color(display-p3 0.156863 0.439216 0.741176)' },
        },
      },
    ];
    expect(printRules(rules)).toMatchInlineSnapshot(`
      "@media (prefers-color-scheme: light) {
        @media (color-gamut: p3) {
          :root {
            --color-blue-6: color(display-p3 0.062745 0.301961 0.529412);
            --color-blue-7: color(display-p3 0.12549 0.364706 0.619608);
            --color-blue-8: color(display-p3 0.156863 0.439216 0.741176);
          }
        }
      }

      @media (color-gamut: p3) {
        [data-color-mode="light"],
        .color-mode-light {
          --color-blue-6: color(display-p3 0.062745 0.301961 0.529412);
          --color-blue-7: color(display-p3 0.12549 0.364706 0.619608);
          --color-blue-8: color(display-p3 0.156863 0.439216 0.741176);
        }
      }"
    `);
  });

  it('nestedQuery (:root)', () => {
    const rules: CSSRule[] = [
      {
        selectors: [':root'],
        nestedQuery: '@media (color-gamut: p3)',
        declarations: {
          '--color-blue-6': { value: 'color(display-p3 0.062745 0.301961 0.529412)' },
          '--color-blue-7': { value: 'color(display-p3 0.12549 0.364706 0.619608)' },
          '--color-blue-8': { value: 'color(display-p3 0.156863 0.439216 0.741176)' },
        },
      },
    ];
    expect(printRules(rules)).toMatchInlineSnapshot(`
      "@media (color-gamut: p3) {
        :root {
          --color-blue-6: color(display-p3 0.062745 0.301961 0.529412);
          --color-blue-7: color(display-p3 0.12549 0.364706 0.619608);
          --color-blue-8: color(display-p3 0.156863 0.439216 0.741176);
        }
      }"
    `);
  });

  it('complex selectors', () => {
    const rules: CSSRule[] = [
      {
        selectors: [
          '[data-color-mode="light"][data-product="default"], [data-color-mode="light"] [data-product="default"]',
        ],
        declarations: { '--color-blue-6': { value: '#104d87' } },
      },
    ];
    expect(printRules(rules)).toMatchInlineSnapshot(`
      "[data-color-mode="light"][data-product="default"], [data-color-mode="light"] [data-product="default"] {
        --color-blue-6: #104d87;
      }"
    `);
  });

  it('color-scheme declarations', () => {
    const rules: CSSRule[] = [
      {
        selectors: [':root'],
        declarations: {
          'color-scheme': { value: 'light dark' },
          '--color-blue-6': { value: '#acd8fc' },
          '--color-blue-7': { value: '#8ec8f6' },
        },
      },
      {
        selectors: ['@media (prefers-color-scheme: light)', '[data-color-theme="light"]'],
        declarations: {
          'color-scheme': { value: 'light' },
          '--color-blue-6': { value: '#acd8fc' },
          '--color-blue-7': { value: '#8ec8f6' },
        },
      },
      {
        selectors: ['@media (prefers-color-scheme: dark)', '[data-color-theme="dark"]'],
        declarations: {
          'color-scheme': { value: 'dark' },
          '--color-blue-6': { value: '#104d87' },
          '--color-blue-7': { value: '#205d9e' },
        },
      },
    ];
    expect(printRules(rules)).toMatchInlineSnapshot(`
      ":root {
        color-scheme: light dark;
        --color-blue-6: #acd8fc;
        --color-blue-7: #8ec8f6;
      }

      @media (prefers-color-scheme: light) {
        :root {
          color-scheme: light;
          --color-blue-6: #acd8fc;
          --color-blue-7: #8ec8f6;
        }
      }

      [data-color-theme="light"] {
        color-scheme: light;
        --color-blue-6: #acd8fc;
        --color-blue-7: #8ec8f6;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          color-scheme: dark;
          --color-blue-6: #104d87;
          --color-blue-7: #205d9e;
        }
      }

      [data-color-theme="dark"] {
        color-scheme: dark;
        --color-blue-6: #104d87;
        --color-blue-7: #205d9e;
      }"
    `);
  });
});
