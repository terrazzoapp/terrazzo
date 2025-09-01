import { defineConfig } from '@terrazzo/cli';

import css from '@terrazzo/plugin-css';
import listing from '@terrazzo/plugin-token-listing';

export default defineConfig({
  outDir: './tokens/',
  plugins: [
    css({
      filename: 'tokens.css',
      // variableName: (token) => token.id.replace(/\./g, '-'),
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
          transform: (token) => {
            const baseName = token.id.split('.').join('/');
            const isLocalStyle = token.$type === 'typography';

            return isLocalStyle ? `${mode}/${baseName}` : baseName;
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
      },
    }),
  ],
});
