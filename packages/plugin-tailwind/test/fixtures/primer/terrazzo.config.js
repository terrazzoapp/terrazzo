import { defineConfig } from '@terrazzo/cli';
import css from '../../../../plugin-css/dist/index.js';
import tailwind from '../../../dist/index.js';

export default defineConfig({
  outDir: '.',
  plugins: [
    css({
      legacyHex: true,
      skipBuild: true,
    }),
    tailwind({
      filename: 'actual.css',
      modeVariants: [
        { variant: 'dark', mode: 'dark' },
        { variant: 'light-hc', mode: 'light-high-contrast' },
        { variant: 'dark-hc', mode: 'dark-high-contrast' },
      ],
      theme: {
        color: {
          blue: ['color.blue.*'],
          green: ['color.green.*'],
          neutral: ['color.neutral.*'],
          orange: ['color.orange.*'],
          purple: ['color.purple.*'],
          red: ['color.red.*'],
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
        radius: ['borderRadius.*'],

        // test arbitrary values
        fooSingle: 'color.orange.100',
        fooArray: ['color.green.*'],
        foo: {
          bar: 'color.purple.500',
          baz: 'color.purple.600',
        },
      },
    }),
  ],
});
