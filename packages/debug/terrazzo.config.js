import { defineConfig } from '@terrazzo/cli';

import css from '@terrazzo/plugin-css';
import sass from '@terrazzo/plugin-sass';
import listing from '@terrazzo/plugin-token-listing';

export default defineConfig({
  outDir: './tokens/',
  plugins: [
    css({
      filename: 'tokens.css',
      // Custom naming will be honoured by the token listing format.
      variableName: (token) => `--prefix-${token.id.replace(/\./g, '-')}`,
      baseSelector: ':root',
    }),

    sass({
      filename: 'tokens.scss',
    }),

    listing({
      // filename: 'terrazzo.listing.json',
      // modes: [
      //   {
      //     name: 'color-scheme',
      //     values: ['light', 'dark'],
      //     description: 'Color theme matching user device preferences',
      //   },
      // ],
      // platforms: {
      //   figma: {
      //     description: 'Figma variables (color, spacing) and local styles (typography)',
      //     filter: (token) => !(token.$key !== 'size.offset.focus-ring'),
      //     name: (token, mode) => {
      //       const baseName = token.id.split('.').join('/');
      //       const isLocalStyle = token.$type === 'typography';

      //       return isLocalStyle && mode ? `${mode}/${baseName}` : baseName;
      //     },
      //   },
      //   css: {
      //     description: 'Tokens built as CSS variables for the developers',
      //     filter: '@terrazzo/plugin-css',
      //     name: '@terrazzo/plugin-css',
      //   },
      //   sass: {
      //     description: 'Tokens exposed through SASS mixins and functions',
      //     filter: '@terrazzo/plugin-sass',
      //     name: '@terrazzo/plugin-sass',
      //   },
      //   tokensstudio: {
      //     description: 'The place where we store our source tokens',
      //     // no filter, all tokens included
      //     name: (token) => token.id,
      //   },
      // },
      // subtype: (token) => {
      //   if (token.$type === 'color') {
      //     if (token.id.includes('background')) {
      //       return 'bgColor';
      //     }
      //     if (token.id.includes('border')) {
      //       return 'borderColor';
      //     }
      //     if (token.id.includes('icon') || token.id.includes('text')) {
      //       return 'fgColor';
      //     }
      //   }

      //   if (token.$type === 'dimension') {
      //     if (token.id.includes('icon')) {
      //       return 'size';
      //     }
      //     if (token.id.includes('space') || token.id.includes('depth')) {
      //       return 'gap';
      //     }
      //     if (token.id.includes('stroke')) {
      //       return 'borderWidth';
      //     }
      //     if (token.id.includes('radius')) {
      //       return 'borderRadius';
      //     }
      //   }

      //   if (token.$type === 'typography') {
      //     return 'compositeFont';
      //   }
      // },
    }),
  ],
});
