import a11y from '../../dist/index.js';
import css from '../../../plugin-css/dist/index.js';

export default {
  tokens: './tokens.yaml',
  outDir: './index/',
  plugins: [a11y(), css()],
  lint: {
    rules: {
      'a11y/contrast': [
        'error',
        {
          checks: [
            {
              tokens: {
                foreground: 'color.high-contrast-text',
                background: 'color.high-contrast-bg',
                typography: 'typography.body',
              },
              wcag2: 'AAA',
              apca: 'silver',
            },
          ],
        },
      ],
    },
  },
};
