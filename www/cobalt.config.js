import sass from '@cobalt-ui/plugin-sass';
import ts from '@cobalt-ui/plugin-ts';
import json from '@cobalt-ui/plugin-json';

export default {
  plugins: [sass(), ts(), json()],
  figma: {
    'https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/Cobalt-Test?node-id=2%3A2': {
      Black: { fill: 'color.black.default' },
      Blue: { fill: 'color.blue.default' },
      'Dark Gray': { fill: 'color.dark_gray.default' },
      Green: { fill: 'color.green.default' },
      Red: { fill: ['color.red.default', 'color.red.light'] },
      Purple: { fill: ['color.purple.default', 'color.purple.light'] },
    },
  },
};
