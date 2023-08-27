---
title: What are Design Tokens?
layout: ../../../layouts/docs.astro
---

# What are Design Tokens?

Tokens are the fundamental building blocks of design. They typically refer to things like colors, typography, and icons, but have no formal definition or restriction on what they can be. Tokens aren’t user interface (UI); they’re the lower-level **common building blocks** that make up a UI design system.

## History

The coinage of the phrase “design tokens” dates back to a <a href="https://www.youtube.com/watch?v=wDBEc3dJJV8" target="_blank" rel="noopener noreferrer">2016 talk with Jina Bolton and Jon Levine</a> talking about Salesforce’s _Lightning Design System_. In it they define their tokens as “basic sub-atoms of their design system.”

<div class="yt-embed">
  <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/wDBEc3dJJV8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Why use Tokens?

It‘s easy to fall into the trap of thinking that a design system is truly complete, and finished, and will never change. The reality is that just like products, design systems go through micro-iterations as well. Colors and typography get tweaked as you go through accessibility audits. Values get improved. It’s more realistic to look at your design system as a living, breathing, evolving creature that changes with time.

Of course, keeping all code across all your products and platforms up-to-date with this changing, evolving, iterative brand is hard. Things have to be embedded into code at some level. So the thinking around design tokens is to find the elements of design that are so small and reusable that they can be managed in one central place and be reused across different programming languages and in different contexts.

## Design Token Formats

Though there is <a href="https://designtokens.org" target="_blank" rel="noopener noreferrer">“one standard to rule them all”</a> being actively worked on by the W3C that hopes to improve upon all previous formats, it’s still **under development** and subject to change.

<div class="yt-embed">
  <iframe
    width="560"
    height="315"
    src="https://www.youtube-nocookie.com/embed/ssOdzxZdg58"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen></iframe>
</div>

Cobalt uses this new W3C community standard in the hopes that it will become a common/universal way of expressing design tokens. To get started, you can view either:

- [Cobalt’s guide to writing tokens](/docs/tokens), or
- [The W3C Design Tokens specification itself](https://design-tokens.github.io/community-group/format/)

Other competing formats include, but aren’t limited to:

- <a href="https://amzn.github.io/style-dictionary" target="_blank" rel="noopener noreferrer">Style Dictionary</a>
- <a href="https://docs.tokens.studio/tokens/token-types" target="_blank" rel="noopener noreferrer">Tokens Studio for Figma plugin</a>
- <a href="https://diez.org" target="_blank" rel="noopener noreferrer">Diez</a>
