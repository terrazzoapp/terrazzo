import pluginTailwind from '@cobalt-ui/plugin-tailwind';

/** @type {import('@cobalt-ui/core').Config} */
export default {
  tokens: ['../github/tokens.json'],
  plugins: [
    pluginTailwind({
      format: 'esm',
      tailwind: {
        theme: {
          color: Object.fromEntries(
            ['blue', 'green', 'red', 'yellow', 'orange', 'purple', 'pink'].map((color) => [
              color,
              {
                50: `base.color.${color}.0`,
                100: `base.color.${color}.1`,
                200: `base.color.${color}.2`,
                300: `base.color.${color}.3`,
                400: `base.color.${color}.4`,
                500: `base.color.${color}.5`,
                600: `base.color.${color}.6`,
                700: `base.color.${color}.7`,
                800: `base.color.${color}.8`,
                900: `base.color.${color}.9`,
                950: `base.color.${color}.9`,
              },
            ]),
          ),
          fontFamily: {
            sans: 'fontStack.sansSerif',
            mono: 'fontStack.monospace',
          },
          screens: {
            xs: 'breakpoint.xsmall',
            sm: 'breakpoint.small',
            md: 'breakpoint.medium',
            lg: 'breakpoint.large',
            xl: 'breakpoint.xlarge',
            '2xl': 'breakpoint.xxlarge',
          },
          spacing: {
            1: 'base.size.4',
            2: 'base.size.8',
            3: 'base.size.12',
            4: 'base.size.16',
            5: 'base.size.20',
            6: 'base.size.24',
            7: 'base.size.28',
            8: 'base.size.32',
            9: 'base.size.36',
            10: 'base.size.40',
            11: 'base.size.44',
            12: 'base.size.48',
            13: 'base.size.64',
            14: 'base.size.80',
            15: 'base.size.96',
            16: 'base.size.112',
            17: 'base.size.128',
          },
        },
      },
    }),
  ],
};
