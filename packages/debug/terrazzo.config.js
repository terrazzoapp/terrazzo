import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import listing from '@terrazzo/plugin-token-listing';

export default defineConfig({
  outDir: './tokens/',
  plugins: [
    css({
      filename: 'tokens.css',
      variableName: (token) => token.id.replace(/\./g, '-'),
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
          type: 'design',
          built: false,
          transform: (token) => {
            const baseName = token.id.split('.').join('/');
            const isLocalStyle = token.$type === 'typography';

            return isLocalStyle ? `${mode}/${baseName}` : baseName;
          },
        },
        tokensstudio: {
          type: 'token-editor',
          built: false,
          transform: (token) => token.id,
        },
        css: {
          type: 'code',
          description: 'Built CSS representations of design tokens maintained by our DS team',
          built: true,
          plugin: '@terrazzo/plugin-css',
        },
      },
    }),
  ],
});
