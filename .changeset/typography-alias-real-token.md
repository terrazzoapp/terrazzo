---
"@terrazzo/token-tools": patch
---

Fix CSS transformation of a typography token that aliases another typography token.

The typography alias path handed `transformAlias` a bare `{ id }` stub cast as a full `TokenNormalized`. Consumers that recursively transform the alias — e.g. `@terrazzo/plugin-token-listing`'s preview-value computation — then dereferenced its missing `mode` and threw `TypeError: Cannot use 'in' operator to search for '.' in undefined`, aborting the build.

The aliased sub-property now resolves to a complete sub-token carrying `$type` / `$value` / `mode`. The default alias transform reads only `id`, so CSS variable output is unchanged; recursive consumers now resolve a correct value instead of crashing.
