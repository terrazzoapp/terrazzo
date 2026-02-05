import css, {type Permutation} from "../../../src/index.js";
import {defineConfig} from '@terrazzo/parser';
import {pathToFileURL} from 'node:url';

const prepare =  (className: string):  (css: string) => string => {
    return (css) => `
.${className} {
  ${css}
}`
}

const permutations: Permutation[] = [
    {
        input: {},
        prepare(css: string): string {
            return `
:root {
  ${css}
}`
        },
        include: ['primitives.*']
    },
     {
        input: {theme: 'orange'},
        prepare: prepare('theme-orange'),
        include:['color']
    },
    {
        input: {theme: 'blue'},
        prepare: prepare('theme-blue'),
        include: ['color']
    },
    {
        input: {mode: 'light'},
        prepare: prepare('mode-light'),
        include: ['orange', 'blue']
    },
    {
        input: {mode: 'dark'},
        prepare: prepare('mode-dark'),
        include: ['orange', 'blue']
    },
];

export default defineConfig(
    {
        plugins: [css({filename: 'actual.css', permutations})],
    },
    {cwd: pathToFileURL(import.meta.url)}
);