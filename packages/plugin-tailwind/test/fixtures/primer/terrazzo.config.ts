import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import tailwind from '../../../dist/index.js';

export default defineConfig({
  outDir: '.',
  lint: {
    rules: {
      'core/consistent-naming': 'off',
    },
  },
  plugins: [
    css({
      skipBuild: true,
    }),
    tailwind({
      filename: 'actual.css',
      defaultTheme: { tzMode:'.' },
      customVariants: {
        dark: {
          selector: ':where(.dark, .dark *)',
          input: { tzMode: 'dark' },
        },
        'light-hc': {
          selector: ':where(.light-hc, .light-hc *)',
          input: { tzMode: 'light-hc' },
        },
        'dark-hc': {
          selector: ':where(.dark-hc, .dark-hc *)',
          input: { tzMode: 'dark-hc' },
        },
      },
      theme: {
        color: {
          blue: ['color.blue.**'],
          green: ['color.green.**'],
          neutral: ['color.neutral.**'],
          orange: ['color.orange.**'],
          purple: ['color.purple.**'],
          red: ['color.red.**'],
          yellow: {
            0: 'color.yellow.0',
            1: 'color.yellow.1',
            2: 'color.yellow.2',
            3: 'color.yellow.3',
            4: 'color.yellow.4',
            5: 'color.yellow.5',
            6: 'color.yellow.6',
            7: 'color.yellow.7',
            8: 'color.yellow.8',
            9: 'color.yellow.9',
          },
        },
        font: {
          sans: 'fontStack.sansSerif',
        },
        spacing: {
          xxs: 'space.xxsmall',
          xs: 'space.xsmall',
          sm: 'space.small',
          md: 'space.medium',
          lg: 'space.large',
          xl: 'space.xlarge',
        },
        radius: ['borderRadius.**'],

        // test arbitrary values
        fooSingle: 'color.orange.1',
        fooArray: ['color.green.**'],
        foo: {
          bar: 'color.purple.5',
          baz: 'color.purple.6',
        },
      },
    }),
  ],
});
