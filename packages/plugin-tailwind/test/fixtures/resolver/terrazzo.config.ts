import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import tailwind from '../../../dist/index.js';

const prepare = (css: string) => css

export default defineConfig({
  tokens: ['dtcg-examples/github-primer.resolver.json'],
  outDir: '.',
  lint: {
    rules: {
      'core/valid-typography': 'off',
    },
  },
  plugins: [
    css({
      skipBuild: true,
      permutations: [
        { input: { theme: 'light' }, prepare },
        { input: { theme: 'dark' }, prepare },
        { input: { theme: 'light-hc' }, prepare },
        { input: { theme: 'dark-hc' }, prepare },
      ]
    }),
    tailwind({
      filename: 'actual.css',
      defaultTheme: { theme: 'light' },
      customVariants: {
        dark: {
          selector: ':where(.dark, .dark *)',
          input: { theme: 'dark' },
        },
        'light-hc': {
          selector: ':where(.light-hc, .light-hc *)',
          input: { theme: 'light-hc' },
        },
        'dark-hc': {
          selector: ':where(.dark-hc, .dark-hc *)',
          input: { theme: 'dark-hc' },
        },
      },
      theme: {
        color: {
          blue: ['base.color.blue.**'],
          green: ['base.color.green.**'],
          neutral: ['base.color.neutral.**'],
          orange: ['base.color.orange.**'],
          purple: ['base.color.purple.**'],
          red: ['base.color.red.**'],
          yellow: {
            0: 'base.color.yellow.0',
            1: 'base.color.yellow.1',
            2: 'base.color.yellow.2',
            3: 'base.color.yellow.3',
            4: 'base.color.yellow.4',
            5: 'base.color.yellow.5',
            6: 'base.color.yellow.6',
            7: 'base.color.yellow.7',
            8: 'base.color.yellow.8',
            9: 'base.color.yellow.9',
          },
        },
        font: {
          sans: 'fontStack.sansSerif',
        },
        spacing: {
          xxs: 'base.size.2',
          xs: 'base.size.4',
          sm: 'base.size.8',
          md: 'base.size.12',
          lg: 'base.size.16',
          xl: 'base.size.32',
        },
        radius: ['borderRadius.**'],

        // test arbitrary values
        fooSingle: 'base.color.orange.1',
        fooArray: ['base.color.green.**'],
        foo: {
          bar: 'base.color.purple.5',
          baz: 'base.color.purple.6',
        },
      },
    }),
  ],
});
