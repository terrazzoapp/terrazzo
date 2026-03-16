import { defineConfig } from "@terrazzo/cli";
import css from '../../../src/index.js';

export default defineConfig({
    tokens: ["./src/resolver.json"],
    outDir: ".",
    plugins: [
        // Base defaults token file. Shared across all brands. Uses brand-1 as defaults.
        css({
            filename: "tokens-default.css",
            permutations: [
                {
                    prepare: (cssContent: string) => {
                        return `:root {\n  ${cssContent}\n}`;
                    },
                    input: { },
                }
            ],
        }),
        css({
            filename: "tokens-brand2.css",
            permutations: [
                {
                    prepare: (cssContent: string) => {
                        return `:root {\n  ${cssContent}\n}`;
                    },
                    input: { brand: "brand2", breakpoint: "breakpoints2" },
                }
            ],
        })
    ],
});