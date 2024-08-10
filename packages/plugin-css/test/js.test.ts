import { build, defineConfig, parse } from '@terrazzo/parser';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import css from '../src/index.js';

// note: many colors’ hex fallbacks are intentionally different from what Culori
// clamps to. this is done intentionally to test the users’ fallbacks are
// respected

describe('Node.js API', () => {
  describe('token types', () => {
    it.each(['boolean', 'border', 'color', 'dimension', 'gradient', 'shadow', 'string', 'typography', 'transition'])(
      '%s',
      async (dir) => {
        const output = 'actual.css';
        const cwd = new URL(`./fixtures/type-${dir}/`, import.meta.url);
        const config = defineConfig(
          {
            plugins: [
              css({
                filename: output,
                variableName: (name) => makeCSSVar(name, { prefix: 'ds' }),
                modeSelectors: [
                  {
                    mode: 'light',
                    tokens: ['color.*', 'gradient.*'],
                    selectors: ['@media (prefers-color-scheme: light)', '[data-color-theme="light"]'],
                  },
                  {
                    mode: 'dark',
                    tokens: ['color.*', 'gradient.*'],
                    selectors: ['@media (prefers-color-scheme: dark)', '[data-color-theme="dark"]'],
                  },
                  {
                    mode: 'light-colorblind',
                    tokens: ['color.*'],
                    selectors: ['[data-color-theme="light-colorblind"]'],
                  },
                  {
                    mode: 'light-high-contrast',
                    tokens: ['color.*'],
                    selectors: ['[data-color-theme="light-high-contrast"]'],
                  },
                  { mode: 'dark-dimmed', tokens: ['color.*'], selectors: ['[data-color-theme="dark-dimmed"]'] },
                  {
                    mode: 'dark-high-contrast',
                    tokens: ['color.*'],
                    selectors: ['[data-color-theme="dark-high-contrast"]'],
                  },
                  { mode: 'dark-colorblind', tokens: ['color.*'], selectors: ['[data-color-theme="dark-colorblind"]'] },
                  { mode: 'desktop', selectors: ['@media (width >= 600px)'] },
                ],
              }),
            ],
          },
          { cwd },
        );
        const tokensJSON = new URL('./tokens.json', cwd);
        const { tokens, sources } = await parse([{ filename: tokensJSON, src: fs.readFileSync(tokensJSON, 'utf8') }], {
          config,
        });
        const result = await build(tokens, { sources, config });
        expect(result.outputFiles.find((f) => f.filename === output)?.contents).toMatchFileSnapshot(
          fileURLToPath(new URL('./want.css', cwd)),
        );
      },
    );
  });

  it('Utility CSS', async () => {
    const output = 'actual.css';
    const cwd = new URL('./fixtures/utility-css/', import.meta.url);
    const config = defineConfig(
      {
        plugins: [
          css({
            filename: output,
            variableName: (name) => makeCSSVar(name, { prefix: 'ds' }),
            utility: {
              bg: ['color.semantic.*', 'color.gradient.*'],
              border: ['border.*'],
              font: ['typography.*'],
              layout: ['space.*'],
              shadow: ['shadow.*'],
              text: ['color.semantic.*', 'color.gradient.*'],
            },
            modeSelectors: [{ mode: 'desktop', selectors: ['@media (width >= 600px)'] }],
          }),
        ],
      },
      { cwd },
    );
    const tokensJSON = new URL('./tokens.json', cwd);
    const { tokens, sources } = await parse([{ filename: tokensJSON, src: fs.readFileSync(tokensJSON, 'utf8') }], {
      config,
    });
    const result = await build(tokens, { sources, config });
    expect(result.outputFiles.find((f) => f.filename === output)?.contents).toMatchFileSnapshot(
      fileURLToPath(new URL('./want.css', cwd)),
    );
  });
});
