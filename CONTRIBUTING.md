# Contributing

All contributions of any nature are welcome.

**💁 First time contributor?**

I’d love for this project to be your first contribution. If you are new to Open Source contributions, please see [https://github.com/firstcontributions/first-contributions] for a handy guide on how to get started. Nearly everything there will apply to
contributing here.

## Setup

This repo requires [pnpm](https://pnpm.io/). Once installed, run:

```sh
pnpm i
```

## Developing

To build TypeScript as you work, run:

```sh
pnpm run dev
```

This project uses [Biome](https://biomejs.dev/), a modern JS toolchain, for linting and formatting.

### `.ts` vs. `.js` + `.d.ts`

Some packages (such as `parser`) are written in raw `.js` and `.d.ts`. The reason is the types are written strictly for the benefit of the user, however, the runtime needs to handle invalid and unexpected input that TypeScript may think is impossible or unnecessary, and it usually gets confused. One way to solve this is typing almost everything as `unknown`, however, that’s essentially the same as just writing `.js` anyway. Another way to look at it is for these packages, `.d.ts` are what’s _expected_ from the user, but often reality won’t match that.

Packages that are wrtitten in `.ts` follow more expected TypeScript conventions.

## Testing

Tests are written in [Vitest](https://vitest.dev), a modern replacement for Jest. To run tests:

```sh
pnpm run build
pnpm test
```

⚠️ **Be sure to build first!** Many tests test the _actual_ built files, not the source `.ts` files.

## Opening a Pull Request

All PRs are welcome! But to save your time, here are some common PRs received and the best course of action to take:

_✨ **Tip**: check out the [good first issue](https://github.com/terrazzoapp/terrazzo/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) and [help wanted](https://github.com/terrazzoapp/terrazzo/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) tags for open issues that need a PR!_

### 🐛 Bugfixes

1. **Open the PR directly.** Always accepted, with or without an accompanying issue, as long as you also add tests. Thank you for fixing it!

### 📖 Documentation Changes

1. **Open an issue.** If this is a larger restructuring, or making huge content changes, we’re open to that! But it may need discussion first. However, if this is a **translation** (always accepted) or **fixing a typo** no issue is needed; just open the PR.
2. **Open the PR.** This will be accepted 🙂.

### ✨ New Feature

1. **Open an issue to discuss.** Before opening a PR, the feature may need some discussion, and a clarifying design! Opening an issue makes sure no work is wasted when it’s time for a PR.
2. **Open the PR.** With a clear goal for the PR, it’ll be easier to write and review, and will chip more quickly!

### 💥 Breaking Change

1. **Open an issue to discuss.** Sure, we never plan _directly_ on breaking the API, but usually it’s part of a larger desired change. Let’s discuss it **in an issue** before opening a PR!
2. **Open a NON-BREAKING PR against `main`** Usually we can do some halfway workaround that somewhat solves the problem without breaking the existing API. But afterward, …
3. **Open a BREAKING PR in the future when pinged**. Cobalt doesn’t have a defined release cycle yet, but at certain times, there will be a branch that contains breaking changes for a future major release. The core maintainers will coordinate with you on how to get the breaking changes in, if they’re accepted.

For all PRs, **adding tests** are required, as is **filling out the description template** and adding a 🦋 **Changeset** if a new version needs to be released (Changeset instructions automatically appear as a PR comment).
