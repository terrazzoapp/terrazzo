# Contributing

Thank you for being willing to contribute to this project! Anyone is able to contribute, and all contributions are welcome. This guide is meant to help you make a successful contribution as quickly as possible. To do that, this guide is organized into 3 main sections:

1. **Workflow**: where do you start? Should you open an issue, or a discussion? How do pull requests work?
2. **Code walkthrough**: general instructions for getting the code running locally, and a summary of notable structures/patterns.
3. **Philosophy**: what does this project value? What does this project try and stay away from?

## Workflow

The basic workflow is organized into the following steps:

1. **Issue/Discussion**: report a bug or suggest a feature or change to this project. Issues are the quickest way to align on an idea before doing any work.
2. **Pull Request**: fork this project, contribute code, and open a pull request back on the original project.
3. **Review**: aligning the code to this project’s standards so it can be accepted.
4. **Acceptance**: congratulations! 🥳 Your contribution has been accepted and it will go out in a future release.

### 1. Opening an Issue or Discussion

The difference between opening an [Issue](https://github.com/terrazzoapp/terrazzo/issues) vs a [Discussion](https://github.com/terrazzoapp/terrazzo/discussions) really depends on **initial clarity.** If you have a clear idea of a bug to report, or change you’d like to suggest, that’s an [Issue](https://github.com/terrazzoapp/terrazzo/issues). You can use the appropriate template to provide all necessary information.

But perhaps you have a loose question, that either may not be linked to a bug, or may even be partially unrelated to Terrazzo. [Discussions](https://github.com/terrazzoapp/terrazzo/discussions) are better for more “casual” conversation threads!

Of course, even if you open one in the wrong place, it can be moved! The main reason they’re distinct is that a GitHub Issue is tracked as work to be done—the more open issues, the more work that is needed. This not only helps maintainers, it also helps other contributors like yourself know what can be fixed!

> [!WARNING]
> Please don’t open a Pull Request without first opening an issue! Even if you are just fixing a simple bug, it’s good to double-check that it actually is a bug, and you’re aligned on the solution. Getting a maintainer’s advice can save a lot of wasted work!

### 2. Pull Requests

So you have code to contribute, and want to get started! The first thing you’ll do is [fork the repository](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) if you haven’t already—just click the big **Fork** button [on the front page](https://github.com/terrazzoapp/terrazzo). This will create a copy of Terrazzo locally.

You’ll then clone that repo:

```sh
git clone [myusername]/terrazzo
```

And you’re ready to get started!

> [!TIP]
> If you want to work on a PR, but don’t have an idea yourself, take a look at [good first issue](https://github.com/terrazzoapp/terrazzo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22) issues! They are friendly for newcomers and have well-defined boundaries.

#### Branches

Terrazzo’s primary branch is the `main` branch. Even though it’s normally a faux pas to commit to the main branch, when you’re working on your fork it’s actually all the same whether you commit to `main` or work in a local branch.

#### Setup

Contributing to this project requires installing Node.js LTS ([fnm](https://github.com/Schniz/fnm) is recommended) and [pnpm](https://pnpm.io/). With both installed, navigate to the root of this project in a terminal, and run the following to install dependencies:

```sh
pnpm i
```

#### Tests

Tests are run in Node.js using [Vitest](https://vitest.dev/). To run _all_ tests, run the following command from the project root:

```sh
pnpm run build
pnpm test
```

To run tests for just a specific package, run:

```sh
pnpm run build
pnpm --filter @terrazzo/[package] run test
```

Lastly, to update snapshots in tests:

```sh
pnpm run test -u
```

> [!TIP]
> Because many Terrazzo packages depend on each other, you won’t be able to run tests if any of its dependencies aren’t built. Make sure to run `pnpm run build` from the root to build all packages so tests work as-expected! There are also a few instances of packages needing to build themeselves, too, before testing, but this isn’t as common.

#### Linting

Linting is handled via [Biome](https://biomejs.dev/). To lint all packages, run the following command from the project root:

```sh
pnpm run lint
```

#### Opening the PR

Say you’ve gotten to a good point to get feedback on your work. As soon as you push your changes (`git push`) to your fork, navigate back to either your fork or the original Terrazzo repo. You should see a banner at the top of the page asking if you want to Open a PR (yes!).

Be sure to **fill out the template** describing very clearly why you’re opening a PR. A good PR meets all the following criteria:

- [ ] References the issue it will close on merging
- [ ] Tests added for the bugfix/feature (tests are always required!)
- [ ] All existing tests passing
- [ ] Lint passing
- [ ] A [changeset](https://github.com/changesets/changesets) added (`patch` or `minor`, `major` changes may only be made by a maintainer)

### 3. Review

PRs are rarely ever rejected, and the review process is always under the premise of trying to help the author get their work merged. As much as possible, **existing tests and lint rules enforce the code standards,** which means you should have an idea of whether your code meets the quality bar of this project from just running tests locally.

Instead, reviewing is meant to catch things like:

- Whether the code constitutes a breaking change, and if so, what the impact is
  - In this event, the reviewer will work with the author to either reduce the impact as much as possible, and/or coordinate a release plan so users can migrate.
- Significant performance regressions (it’s normal and expected that adding code slows something down by an imperceptible amount, but a single PR slowing everything down by, say, 2× is avoidable).
- Whether there are invisible regressions to things beyond the scope of the codebase, such as specific consumer usecases (which usually highlights a failure in the test suite, in which case it should be patched as soon as possible).
- Upcoming changes or behind-the-scenes work where there may be a conflict and potentially wasted work on one end or the other.

The reviewer will then either **Approve** or **Request Changes** with a clear path to resolution.

#### Rejecting PRs

Again, it’s very rare PRs are rejected! Almost every time this happens, it’s from someone that didn’t read this document. Examples include:

- Introducing a breaking change without any prior discussion (“Sir this is a Wendy’s” PRs)
- Not referencing any issues, and giving almost no explanation for the change
- PR has been open for a very long time without any updates, and tests are failing

There’s essentially a zero chance that if you are opening a PR to close out an issue, your PR will be rejected. There’s also a zero chance that a maintainer giving you the greenlight to open a PR, rejecting it in the end. Rejecting PRs ultimately is trying to guard against this library breaking for users! And as long as you’re mindful of _improving_ and not degrading quality, you will likely never have a PR rejected from this project.

### 4. Acceptance

When a PR has been **Approved,** all tests are passing, and a [changeset](https://github.com/changesets/changesets) has been added, it will be merged and will go out on the next release. The author will have their name forever enshrined in the changelog, and is encouraged to brag about their accomplishment to everyone. They are now a bonified open source contributor (if they weren’t already) and are a philanthropist and beautiful person inside and out. It’s science.

## Code walkthrough

This section outlines some more nitty-gritty code details and general organization about the project. For a more conceptual approach, see [Philosophy](#philosophy) instead.

### Packages

This monorepo is managed by [pnpm Workspaces](https://pnpm.io/workspaces), which means every package internally behaves like it’s been published to npm. This is fantastic for testing changes in lockstep—a package can be tested in its parent package, and its parent’s parent package, and so on, all before a version is released.

The [packages/](./packages/) directory contains all the npm libraries that are published to npm under the `@terrazzo/` org:

| Package           | Description                                                                                                                                                                                                                               |
| :---------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parser`          | The pure JS library that validates DTCG Tokens JSON, runs linters, and runs plugins to produce builds. It can run in Node.js or the browser (restricted by plugins, of course—it can only run in the browser if all the plugins do, too). |
| `token-tools`     | A Swiss Army Knife library that contains a lot of common operations and transforms used by plugins. It’s abstracted mostly as a convenience, so people can build their own plugins more easily.                                           |
| `cli`             | The wrapper around `parser` that handles the Node.js CLI.                                                                                                                                                                                 |
| `plugin-css`      | Plugin to generate `.css`.                                                                                                                                                                                                                |
| `plugin-js`       | Plugin to generate `.js` and `.json`.                                                                                                                                                                                                     |
| `plugin-sass`     | Plugin to generate `.scss`.                                                                                                                                                                                                               |
| `plugin-tailwind` | Plugin to generate a Tailwind v4 theme.                                                                                                                                                                                                   |

The other packages beyond these are in various states of readiness, and can be ignored. There are some packages that are slated for future release that are still under development.

### Docs

[terrazzo.app](https://terrazzo.app) is powered by [Astro](https://astro.build) and lives in [www/](./www/).

### Releases

Releasing is done only by maintainers, but it’s handled by [changesets](https://github.com/changesets/changesets). Whenever any changelog is generated, an automated release PR is opened. If a maintainer approves and merges that PR, all the released versions will be published to npm.

> [!WARNING]
> Changesets has limitations in how it bumps nested packages like Terrazzo has. For this reason, the release PRs almost always have to be manually massaged to work correctly.

## Philosophy

### Timeline

Many of the project’s decisions can be explained as a simple timeline:

- 2017: Amazon releases [Style Dictionary](https://styledictionary.com/), a tool for generating code from design tokens in JSON. Its unopinionated design lets you store tokens any way you want. Great for individual flexibility, but not-so-great for portability as everyone’s “reinventing the wheel” over and over again.
- 2021–2022: The [W3C Design Tokens Community Group](https://www.w3.org/community/design-tokens/) release significant versions to codify design tokens in JSON in a more standardized way, largely as a reaction to Style Dictionary’s laissez-faire design.
- 2021: Drew releases [Cobalt](https://cobalt-ui.pages.dev) because the W3C Design Tokens specification had no tooling that supported it. Style Dictionary would go on to support it in 2024 in its 4.0 release.
- 2023: Cobalt renames to Terrazzo (it’s the same project)

So while it’s not necessarily accurate to call Terrazzo a “successor” to Style Dictionary (at least, not yet), these 3 parts—Style Dictionary, DTCG, and Terrazzo—are all reacting to one another in the design tokens tooling space.

### Snapshot tests

Snapshot tests aren’t perfect for everything. But in a project like this they really shine—they capture even the tiniest regressions in output even if you didn’t mean to test for it originally. The flipside is by capturing every minute detail, sometimes “failures” are intentional, and you’ll always get a snapshot diff when making any sort of change.

> [!WARNING]
> Be sure to inspect all changes carefully! Never blindly accept snapshot changes—they may introduce really tricky regressions that will be hard to fix later..
