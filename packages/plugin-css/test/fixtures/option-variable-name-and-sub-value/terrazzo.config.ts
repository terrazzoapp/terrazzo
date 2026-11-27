import { defineConfig } from '@terrazzo/cli';
import css from '../../../src/index.js';

export default defineConfig({
  tokens: ['tokens.resolver.json'],
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'index.css',
      propertyDefinitions: true,
      variableName: (token) => `--ds_${token.id.replaceAll('.', '__')}`,
      subValueVariableName: (variableName, subValueName) => `${variableName}__${subValueName}`,
      utility: {
        bg: ['color.brandBlue'],
        font: ['typography.bodyText'],
      },
      permutations: [
        {
          input: {},
          prepare: (contents) => `:root {\n  ${contents}\n}`,
        },
      ],
    }),
  ],
});
