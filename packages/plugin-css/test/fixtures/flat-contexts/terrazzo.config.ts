import css, {type Permutation} from "../../../src/index.js";
import {defineConfig, parse} from '@terrazzo/parser';
import fs from "node:fs/promises";
import {pathToFileURL} from 'node:url';


const resolverPath =  new URL("./resolver.json", import.meta.url);

const { resolver, tokens } = await parse({
  filename: resolverPath,
  src: await fs.readFile(resolverPath, "utf-8"),
});

const allTokens = new Set(Object.keys(tokens));
/**
 * All token names defined in resolver sets
 */
const rootTokens = Object.values(resolver.source.sets || {}).reduce((acc, set) => {
    return acc.union(set.sources.reduce((acc, source) => {
        return acc.union(new Set(Object.keys(source).filter(k => !k.startsWith('$'))));
    }, new Set<string>()));
}, new Set<string>())


const permutations: Permutation[] = [
    // Root permutation
    {
        // default input
        input: {},
        prepare(css: string): string {
            return `
:root {
  ${css}
}`
        },
        ignore: [...allTokens.difference(rootTokens)]
    }
];

Object.values(resolver.source.modifiers || {}).forEach(modifier => {
    const modifierTokens = Object.values(modifier.contexts).reduce((acc, context) => {
            return acc.union(context.reduce((acc, source) => {
                return acc.union(new Set(Object.keys(source).filter(k => !k.startsWith('$'))))
            }, new Set<string>()));
    }, new Set<string>())

    Object.keys(modifier.contexts).forEach(context => {
        permutations.push({
            input: {[modifier.name]:context},
            prepare(css: string): string {
                return `
.${modifier.name}-${context} {
  ${css}
}`
            },
            ignore: [...allTokens.difference(modifierTokens)]
        });
    })
})

export default defineConfig(
    {
        plugins: [css({filename: 'actual.css', permutations})],
    },
    {cwd:  pathToFileURL(import.meta.url)}
);