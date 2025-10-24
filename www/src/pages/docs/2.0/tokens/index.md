---
title: What are Design Tokens?
layout: ../../../layouts/docs.astro
---

# What are Design Tokens?

Design Tokens are just _one part_ of a design system, including, but not limited to components, patterns, icons, guidelines, principles, accessibility standards, and more. Tokens typically represent **color** and **typography** to keep designs consistent and on-brand across all media, but can even extend to things like grid systems, styling, animations, and more.

[UXLord](https://www.youtube.com/@uxlordsimplifyingdesignpro5544) has a great 6-minute explainer video if you’re new to the concept:

<div class="yt-embed"><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/wtTstdiBuUk?si=K74YVh9yXJFpXj8d" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>

If you’ve ever sunk time into syncing colors, typography, borders, spacing, and other values from Figma to code and vice-versa, an automated **Design Token System** can speed up that process while reducing errors and reducing manual labor. Terrazzo is an open-source, MIT-licensed system for managing your design tokens built on the open standard [W3C Design Tokens Community Group (DTCG)](https://www.designtokens.org/) format.

## The Workflow

The main idea is your tokens get saved in a [JSON](https://en.wikipedia.org/wiki/JSON) format (DTCG) we’ll refer to as **tokens.json** on this site. The main flow is:

1. **Export tokens.json from Figma** (or whatever design program you use)
2. **Import tokens.json into [Token Lab](/lab)**: powerful color and typography tools to polish your design system
3. **Save your new tokens.json**: keep it safe!
4. **Use the Terrazzo CLI to generate code**: make your developers happy in any language of your stack.

### 1. Export tokens.json from Figma

[Figma supports DTCG natively](https://www.youtube.com/watch?v=KA2WwX7qlYA) if you are keen to write code yourself, but if not, the open-source [TokensBrücke plugin](https://www.figma.com/community/plugin/1254538877056388290/tokensbrucke) (German for “bridge”) can export `tokens.json` file for you (just be sure to turn the “Use DTCG keys Format” switch on).

Once you have that `.json` file on your computer, you’re ready for the next step!

#### PenPot

If using [PenPot](https://penpot.app/), an open-source Figma alternative, the [penpot-export](https://github.com/penpot/penpot-export) extension can output `tokens.json` in DTCG format.

### 2. Import tokens.json into Token Lab

Drag-and-drop `tokens.json` into the code editor on the [Token Lab](/lab) sidepanel and get to work. As you work, this will automatically be updated for you. Be sure to **save often** since Terrazzo won’t handle versions / unlimited undos (yet).

### 3. Save your tokens.json

Click the **Save** button in the top menu, or hit <kbd>⌘</kbd> + <kbd>S</kbd> to open a save dialog. Save the `tokens.json` file in a safe place (also use this to keep versions, e.g. `tokens-2024-01-18.json`).

### 4. Use the Terrazzo CLI to generate code

The [Terrazzo CLI](/docs/cli) can generate [CSS](/docs/cli/integrations/css), [Sass](/docs/cli/integrations/sass), [JavaScript/TypeScript](/docs/cli/integrations/js), [JSON](/docs/cli/integrations/json), [Tailwind](/docs/cli/integrations/tailwind), and more. You can also [write your own plugin easily](/docs/cli/api/plugin-development) to generate any type of format you need.
