import css, {type Permutation} from "../../../src/index.js";
import type {ResolverModifierNormalized, ResolverSourceNormalized} from "@terrazzo/parser";
import {defineConfig, type Group, type Token, parse} from '@terrazzo/parser';
import fs from "node:fs/promises";
import {pathToFileURL} from 'node:url';


const resolverPath = new URL("./resolver.json", import.meta.url);

const {resolver} = await parse({
    filename: resolverPath,
    src: await fs.readFile(resolverPath, "utf-8"),
});


/**
 * These three would be very useful to have in the resolver API
 */
function getDeclaredTokens(group: Group, root: string[] = []): string[] {
    const isToken = (t: Group | Token): t is Token => '$value' in t;

    const isRootToken = (t: Group | Token): t is Token => '$root' in t;

    return Object.entries(group)
        .filter(([k]) => !k.startsWith('$'))
        .map(function* ([k, v]) {
                if (isToken(v) || isRootToken(v)) {
                    yield [...root, k].join('.')
                }
                if (!isToken(v)) {
                    yield* getDeclaredTokens(v, [...root, k]);
                }
            }
        ).flatMap(v => [...v]);
}


function extractTokenNames(...groups: Group[]): string[] {
    return [...groups.reduce((acc, group) => {
        return acc.union(new Set(getDeclaredTokens(group)))
    }, new Set<string>())]
}

function extractTokensFromSets(sets: ResolverSourceNormalized['sets']): string[] {
    return [...Object.values(sets || {}).reduce((acc, set) => {
        return acc.union(new Set(extractTokenNames(...set.sources)));
    }, new Set<string>())]
}

function extractTokensFromContexts(contexts: ResolverModifierNormalized['contexts']): string[] {
    return Object.values(contexts).flatMap(groups => extractTokenNames(...groups))
}

function iterateModifiers(modifiers: ResolverSourceNormalized['modifiers']): (readonly [ResolverModifierNormalized, string])[] {
    return Object.values(modifiers || {}).flatMap(modifier => Object.keys(modifier.contexts).map(context => [modifier, context] as const))
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
        include: extractTokensFromSets(resolver.source.sets)
    },
    ...iterateModifiers(resolver.source.modifiers).map(([modifier, context]) => ({
        input: {[modifier.name]: context},
        prepare(css: string): string {
            return `
.${modifier.name}-${context} {
  ${css}
}`
        },
        include: extractTokensFromContexts(modifier.contexts)
    }))
];

export default defineConfig(
    {
        plugins: [css({filename: 'actual.css', permutations})],
    },
    {cwd: pathToFileURL(import.meta.url)}
);