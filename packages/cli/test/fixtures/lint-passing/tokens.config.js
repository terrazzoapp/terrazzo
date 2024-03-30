import a11y from '../../../../lint-a11y/dist/index.js';
import pluginJS from '../../../../plugin-js/dist/index.js';

export default {
  tokens: '../../../../../examples/radix/tokens.yaml',
  plugins: [a11y(), pluginJS()],
  lint: {
    rules: {
      'duplicate-values': 'off',
      'a11y/contrast': [
        'error',
        {
          checks: [
            {
              tokens: {
                background: 'color.primitive.tomato.2',
                foreground: 'color.primitive.tomato.11',
              },
            },
          ],
        },
      ],
    },
  },
};
