import { defineConfig } from '@terrazzo/cli';
import css from "../../../src/index.js";

export default defineConfig({
  tokens: ['resolver.json'],
  outDir: '.',
  plugins: [
    css({
      filename: 'index.css',
      permutations:[
        {
          input: {},
          prepare: (contents) => `:root {\n  ${contents}\n}`,
          include: ['primitives.*'],
        },
        {
          input: { theme: 'orange'},
          prepare: (contents) => `.theme-orange {\n  ${contents}\n}`,
          include: ['color'],
        },
        {
          input: { theme: 'blue' },
          prepare:  (contents) => `.theme-blue {\n  ${contents}\n}`,
          include: ['color'],
        },
        {
          input: { mode: 'light' },
          prepare: (contents) => `.mode-light {\n  ${contents}\n}`,
          include: ['orange', 'blue'],
        },
        {
          input: { mode: 'dark' },
          prepare:  (contents) => `.mode-dark {\n  ${contents}\n}`,
          include: ['orange', 'blue'],
        },
      ],
    }),
  ],
});
