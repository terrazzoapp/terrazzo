import { defineConfig } from '@terrazzo/cli';
import css from "../../../src/index.js";

const prepare = (className: string): (css: string) => string => {
    return (css) => `
.${className} {
  ${css}
}`
}

export default defineConfig({
  tokens: ['resolver.json'],
  outDir: '.',
  plugins: [
    css({
      filename: 'actual.css',
      permutations:[
        {
          input: {},
          prepare: (css) => `
:root {
  ${css}
}`,
          include: ['primitives.*'],
        },
        {
          input: { theme: 'orange'},
          prepare: prepare('theme-orange'),
          include: ['color'],
        },
        {
          input: { theme: 'blue' },
          prepare: prepare('theme-blue'),
          include: ['color'],
        },
        {
          input: { mode: 'light' },
          prepare: prepare('mode-light'),
          include: ['orange', 'blue'],
        },
        {
          input: { mode: 'dark' },
          prepare: prepare('mode-dark'),
          include: ['orange', 'blue'],
        },
      ],
    }),
  ],
});
