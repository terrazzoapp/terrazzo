import { defineConfig } from '@terrazzo/cli';

import css from '@terrazzo/plugin-css';
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

    listing({
      // Output file name.
      filename: 'terrazzo.listing.json',
      // All the modes present in the token system. Helps tools filter
      // for specific modes and build mode select UIs.
      modes: [
        {
          name: 'color-scheme',
          values: ['light', 'dark'],
          description: 'Color theme matching user device preferences',
        },
      ],

      // Configuration for all the systems consuming design tokens.
      // Lists how each system names the tokens, whether tokens have
      // gone through a transform process in a token translator or
      // whether they support DTCG instead.
      names: {
        figma: {
          description: 'Our variables (color, spacing) and styles (typography)',
          transform: (token, mode) => {
            const baseName = token.id.split('.').join('/');
            const isLocalStyle = token.$type === 'typography';

            return isLocalStyle ? `${mode !== '.' ? `${mode}/` : ''}${baseName}` : baseName;
          },
        },
        tokensstudio: {
          description: 'The place where we store our source tokens',
          transform: (token) => token.id,
        },
        css: {
          description: 'Our built tokens in CSS for the developers',
          plugin: '@terrazzo/plugin-css',
        },
      },

      // For each of the defined names, filter which tokens are available in the matching environment.
      // If a filter is omitted for a given environment name, all tokens are considered included.
      filters: {
        // You may pass a function to use custom filtering logic.
        figma: (token) => !(token.$key !== 'size.offset.focus-ring'),

        // You may pass a Terrazzo plugin name to use this plugin’s internal filtering logic.
        css: '@terrazzo/plugin-css',
      },

      // ALT SYNTAX?
      outputs: {
        figma: {
          description: 'Figma variables (color, spacing) and local styles (typography)',
          filter: (token) => !(token.$key !== 'size.offset.focus-ring'),
          name: (token, mode) => {
            const baseName = token.id.split('.').join('/');
            const isLocalStyle = token.$type === 'typography';

            return isLocalStyle ? `${mode !== '.' ? `${mode}/` : ''}${baseName}` : baseName;
          },
        },
        css: {
          description: 'Tokens built as CSS variables for the developers',
          filter: '@terrazzo/plugin-css',
          name: '@terrazzo/plugin-css',
        },
        tokensstudio: {
          description: 'The place where we store our source tokens',
          // no filter, all tokens included
          name: (token) => token.id,
        },
      },

      subtype: (token) => {
        if (token.$type === 'color') {
          if (token.id.includes('background')) {
            return 'bgColor';
          }
          if (token.id.includes('border')) {
            return 'borderColor';
          }
          if (token.id.includes('icon') || token.id.includes('text')) {
            return 'fgColor';
          }
        }

        if (token.$type === 'dimension') {
          if (token.id.includes('icon')) {
            return 'size';
          }
          if (token.id.includes('space') || token.id.includes('depth')) {
            return 'gap';
          }
          if (token.id.includes('stroke')) {
            return 'borderWidth';
          }
          if (token.id.includes('radius')) {
            return 'borderRadius';
          }
        }

        if (token.$type === 'typography') {
          return 'compositeFont';
        }
      },
    }),
  ],
});
