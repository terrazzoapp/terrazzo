import pluginCSS from '../../../../plugin-css/dist/index.js';

/** @type {import('@cobalt-ui/core').Config} */
export default {
  plugins: [pluginCSS()],
  lint: {
    rules: {
      'required-children': [
        'error',
        {
          matches: [
            {
              match: ['color.*'],
              requiredTokens: ['100', '200', '300'],
            },
          ],
        },
      ],
    },
  },
};
