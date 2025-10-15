import { createRequire } from 'node:module'
import path from 'node:path';

const require = createRequire(import.meta.url);

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [getAbsolutePath("@storybook/addon-docs")],

  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
    disableTelemetry: true,
  },

  docs: {
    docsMode: false
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};
export default config;

function getAbsolutePath(value) {
  return path.dirname(require.resolve(path.join(value, 'package.json')));
}
