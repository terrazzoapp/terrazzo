---
title: Storybook
layout: ../../../layouts/docs.astro
---

# Storybook

Terrazzo doesn’t have an official Storybook integration, but check out these related projects from the community!

## Swatchbook

[Swatchbook](https://unpunnyfuns.github.io/swatchbook/) is a third-party Storybook plugin that is a visualizer for DTCG tokens based on Terrazzo, maintained by <a class="gh-user" href="https://github.com/unpunnyfuns"><img class="gh-avatar" src="https://avatars.githubusercontent.com/u/91497503?v=4" aria-hidden />@unpunnyfuns</a>.

From the docs:

> A Storybook addon and MDX doc blocks for visualizing [DTCG design tokens](https://designtokens.org), built on Terrazzo's parser. Your production build runs Terrazzo's CLI against the same DTCG source; swatchbook reads it too, inside Storybook, and keeps the two aligned.
>
> Two things in one package:
>
> - **Doc blocks.** React components for MDX: `TokenDetail`, `TokenTable`, `TokenNavigator`, `ColorPalette`, `TypographyScale`, and per-type previews for motion, shadow, border, gradient, stroke style.
> - **A toolbar theme switcher.** One dropdown per modifier axis in your DTCG resolver. Flip mode, brand, contrast, density — whatever your system has — and tokens repaint live.
>
> If your existing stories already style with CSS variables, they'll pick up the switcher's flips automatically. That's mostly what the tool does.
>
> #### Who it's for
>
> Design-system authors with DTCG tokens, especially systems with more than one independent dimension (brand × mode, contrast × mode, density). If your system has exactly one dimension and no plans for more, [`@storybook/addon-themes`](https://storybook.js.org/addons/@storybook/addon-themes)' single-string-ID model is simpler and a better fit.

[View Documentation](https://unpunnyfuns.github.io/swatchbook/)
