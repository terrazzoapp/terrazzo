# Contributing to @terrazzo/parser

This document contains developer notes and context for @terrazzo/parser. For general contribution guidelines, see [CONTRIBUTING.md](../../CONTRIBUTING.md) in the root.

## What this package does

- Parses, validates, and normalizes tokens.json
- Executes plugins and builds output
- Executes linting

## What this package DOES NOT do

- Write files to disk (that’s a job for Node.js; this can be run in a browser)

## Manual JS and DTS

This package is unique in its manual handling of `.js` and `.d.ts` files (TypeScript definitions). The expected norm is to write `.ts`, and have `.js` and `.d.ts` be generated automatically from source. But in this project, we write `.js` by hand because this specific module has several unique concerns:

1. **It’s dealing with external (possibly invalid) code.** Now, you’d think that `.ts` would be better at handling this, but the reality when dealing with user-submitted code is if you type it too strongly, TS lulls you into a false sense of security and misses necessary assertions. If you type it weakly, then TS requires _too many_ assertions and you end up with boilerplate and noise. Or if you don’t type it at all, then TS doesn’t really provide any value in the first place, and you might as well skip it.

2. **It’s dealing with ASTs.** We’re parsing JSON ASTs using Momoa, and building ad hoc structures on-the-fly. ASTs usually trip TS up because the discrimination isn’t clear (e.g. if `.type == 'foo'`, then `[property]` exists). Most ASTs don’t have perfect types out-of-the-box, and attempting to re-type an AST yourself is overkill. Further, to the previous point, we may be dealing with invalid code, and the AST may not always be in predictable shapes! When faced with these problems, TS at best requires extra boilerplate; at worst guides you into incorrect decisions.

Given both of these, you usually end up with so many `// @ts-ignore`s or `as any`s that TS doesn’t provide benefit.

But this package is unique! Look in any other package in this monorepo, and you’ll see it’s fully written in `.ts` source files. Different concerns require different approaches.
