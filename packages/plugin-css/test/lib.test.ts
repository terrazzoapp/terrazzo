import { describe, expect, it } from 'vitest';
import { type CSSDeclaration, type CSSRule, getIndentFromPrepare, printRules } from '../src/lib.js';

describe('printRules', () => {
  it('basic', () => {
    const rules: CSSRule[] = [
      {
        type: 'Rule',
        prelude: [':root'],
        children: [
          { type: 'Declaration', property: '--color-blue-6', value: '#acd8fc', comment: 'Blue 6' },
          { type: 'Declaration', property: '--color-blue-7', value: '#8ec8f6', comment: 'Blue 7' },
          { type: 'Declaration', property: '--color-blue-8', value: '#5eb1ef', comment: 'Blue 8' },
        ],
      },
      {
        type: 'Rule',
        prelude: ['@media (prefers-color-scheme: light)', '[data-color-mode="light"]', '.color-mode-light'],
        children: [
          { type: 'Declaration', property: '--color-blue-6', value: '#acd8fc' },
          { type: 'Declaration', property: '--color-blue-7', value: '#8ec8f6' },
          { type: 'Declaration', property: '--color-blue-8', value: '#5eb1ef' },
        ],
      },
      {
        type: 'Rule',
        prelude: ['@media (prefers-color-scheme: dark)', '[data-color-mode="dark"]', '.color-mode-dark'],
        children: [
          { type: 'Declaration', property: '--color-blue-6', value: '#104d87' },
          { type: 'Declaration', property: '--color-blue-7', value: '#205d9e' },
          { type: 'Declaration', property: '--color-blue-8', value: '#2870bd' },
        ],
      },
      {
        type: 'Rule',
        prelude: ['.font-default'],
        children: [
          { type: 'Declaration', property: 'font-family', value: 'var(--typography-default-font-family)' },
          { type: 'Declaration', property: 'font-size', value: 'var(--typography-default-font-size)' },
          { type: 'Declaration', property: 'font-weight', value: 'var(--typography-default-font-weight)' },
          { type: 'Declaration', property: 'line-height', value: 'var(--typography-default-line-height)' },
        ],
      },
    ];

    expect(printRules(rules)).toMatchInlineSnapshot(`
      ":root {
        /* Blue 6 */
        --color-blue-6: #acd8fc;
        /* Blue 7 */
        --color-blue-7: #8ec8f6;
        /* Blue 8 */
        --color-blue-8: #5eb1ef;
      }

      @media (prefers-color-scheme: light) {
        :root {
          --color-blue-6: #acd8fc;
          --color-blue-7: #8ec8f6;
          --color-blue-8: #5eb1ef;
        }
      }

      [data-color-mode="light"], .color-mode-light {
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

      [data-color-mode="dark"], .color-mode-dark {
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

  it('root declarations', () => {
    const rules: CSSDeclaration[] = [
      { type: 'Declaration', property: '--color-blue-6', value: '#acd8fc', comment: 'Blue 6' },
      { type: 'Declaration', property: '--color-blue-7', value: '#8ec8f6', comment: 'Blue 7' },
      { type: 'Declaration', property: '--color-blue-8', value: '#5eb1ef', comment: 'Blue 8' },
    ];
    expect(printRules(rules, { indentChar: '  ', indentLv: 1 })).toBe(`/* Blue 6 */
  --color-blue-6: #acd8fc;
  /* Blue 7 */
  --color-blue-7: #8ec8f6;
  /* Blue 8 */
  --color-blue-8: #5eb1ef;`);
  });

  it('nested rules', () => {
    const rules: CSSRule[] = [
      {
        type: 'Rule',
        prelude: ['@media (prefers-color-scheme: light)'],
        children: [
          {
            type: 'Rule',
            prelude: ['@media (color-gamut: p3)'],
            children: [
              {
                type: 'Declaration',
                property: '--color-blue-6',
                value: 'color(display-p3 0.062745 0.301961 0.529412)',
              },
              { type: 'Declaration', property: '--color-blue-7', value: 'color(display-p3 0.12549 0.364706 0.619608)' },
              {
                type: 'Declaration',
                property: '--color-blue-8',
                value: 'color(display-p3 0.156863 0.439216 0.741176)',
              },
            ],
          },
        ],
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
      }"
    `);
  });

  it('complex selectors', () => {
    const rules: CSSRule[] = [
      {
        type: 'Rule',
        prelude: [
          '[data-color-mode="light"][data-product="default"], [data-color-mode="light"] [data-product="default"]',
        ],
        children: [{ type: 'Declaration', property: '--color-blue-6', value: '#104d87' }],
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
        type: 'Rule',
        prelude: [':root'],
        children: [
          { type: 'Declaration', property: 'color-scheme', value: 'light dark' },
          { type: 'Declaration', property: '--color-blue-6', value: '#acd8fc' },
          { type: 'Declaration', property: '--color-blue-7', value: '#8ec8f6' },
        ],
      },
      {
        type: 'Rule',
        prelude: ['@media (prefers-color-scheme: light)', '[data-color-theme="light"]'],
        children: [
          { type: 'Declaration', property: 'color-scheme', value: 'light' },
          { type: 'Declaration', property: '--color-blue-6', value: '#acd8fc' },
          { type: 'Declaration', property: '--color-blue-7', value: '#8ec8f6' },
        ],
      },
      {
        type: 'Rule',
        prelude: ['@media (prefers-color-scheme: dark)', '[data-color-theme="dark"]'],
        children: [
          { type: 'Declaration', property: 'color-scheme', value: 'dark' },
          { type: 'Declaration', property: '--color-blue-6', value: '#104d87' },
          { type: 'Declaration', property: '--color-blue-7', value: '#205d9e' },
        ],
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

  it('4 spaces', () => {
    const rules: CSSRule[] = [
      {
        type: 'Rule',
        prelude: [':root'],
        children: [
          { type: 'Declaration', property: '--color-blue-6', value: '#acd8fc', comment: 'Blue 6' },
          { type: 'Declaration', property: '--color-blue-7', value: '#8ec8f6', comment: 'Blue 7' },
          { type: 'Declaration', property: '--color-blue-8', value: '#5eb1ef', comment: 'Blue 8' },
        ],
      },
    ];
    expect(printRules(rules, { indentChar: '    ' })).toBe(`:root {
    /* Blue 6 */
    --color-blue-6: #acd8fc;
    /* Blue 7 */
    --color-blue-7: #8ec8f6;
    /* Blue 8 */
    --color-blue-8: #5eb1ef;
}`);
  });

  it('tabs', () => {
    const rules: CSSRule[] = [
      {
        type: 'Rule',
        prelude: [':root'],
        children: [
          { type: 'Declaration', property: '--color-blue-6', value: '#acd8fc', comment: 'Blue 6' },
          { type: 'Declaration', property: '--color-blue-7', value: '#8ec8f6', comment: 'Blue 7' },
          { type: 'Declaration', property: '--color-blue-8', value: '#5eb1ef', comment: 'Blue 8' },
        ],
      },
    ];
    expect(printRules(rules, { indentChar: '\t' })).toBe(`:root {
\t/* Blue 6 */
\t--color-blue-6: #acd8fc;
\t/* Blue 7 */
\t--color-blue-7: #8ec8f6;
\t/* Blue 8 */
\t--color-blue-8: #5eb1ef;
}`);
  });
});

describe('getIndentFromPrepare', () => {
  it('2 space', () => {
    expect(
      getIndentFromPrepare(
        (css) => `.mySelector {
  ${css}
}`,
      ),
    ).toEqual({ indentChar: '  ', indentLv: 1 });
  });

  it('4 space', () => {
    expect(
      getIndentFromPrepare(
        (css) => `.mySelector {
    ${css}
}`,
      ),
    ).toEqual({ indentChar: '    ', indentLv: 1 });
  });

  it('0 spaces', () => {
    expect(getIndentFromPrepare((css) => `.mySelector {${css}}`)).toEqual({ indentChar: '  ', indentLv: 1 });
  });

  it('tab', () => {
    expect(getIndentFromPrepare((css) => `.mySelector {\n\t${css}\n}`)).toEqual({ indentChar: '\t', indentLv: 1 });
  });

  it('nested', () => {
    expect(
      getIndentFromPrepare(
        (css) => `.foo {
  --not-relevant: 0;
}

@media (width >= 600px) {
  /* { */
  .foo {
    --not-relevant: 0;
  }

  .mySelector {
    .mySelector2 {
      ${css}
    }
  }
}`,
      ),
    ).toEqual({ indentChar: '  ', indentLv: 3 });
  });
});
