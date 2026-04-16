import { defineConfig } from "@terrazzo/cli";
import { makeCSSVar } from "@terrazzo/token-tools/css";
import css from '../../../src/index.js'

export default defineConfig({
  tokens: ['typography.tokens.json'],
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'index.css',
      variableName: (token) => makeCSSVar(token.id, { prefix: 'ds' }),
      subValueVariableName(variableName, subValueName) {
        return `${variableName}__${subValueName}`;
      },
    })
  ]
})
