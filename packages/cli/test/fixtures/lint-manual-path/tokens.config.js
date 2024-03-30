import a11y from '../../../../lint-a11y/dist/index.js';

export default {
  // no "tokens" specified
  plugins: [a11y()],
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
