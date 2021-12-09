---
title: Tokens
layout: ../../../layouts/docs.astro
---

# What are Tokens?

Tokens are the fundamental building blocks of design. They typically refer to
things like colors, typography, and icons, but have no formal definition or
restriction on what they can be. **Tokens aren’t user interface (UI); they’re
the building blocks of a UI component.**

One of the earliest mentions of “design tokens” dates back to a 2016 talk with
Jina Bolton and Jon Levine talking about Salesforce’s _Lightning Design System_.
In it they define their tokens as “basic sub-atoms of their design system.”

<div class="yt-embed">
  <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/wDBEc3dJJV8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Why use Tokens?

It‘s easy to fall into the trap of thinking that a design system is truly
complete, and finished, and will never change. The reality is that just like
products, design systems go through micro-iterations as well. Colors and
typography get tweaked as you go through accessibility audits. Values get
improved. It’s more realistic to look at your design system as a living,
breathing, evolving creature that changes with time.

Of course, keeping all code across all your products and platforms up-to-date
with this changing, evolving, iterative brand is hard. Things have to be
embedded into code at some level. So the thinking around design tokens is to
find the elements of design that are so small and reusable that they can be
managed in one central place and be reused across different programming
languages and in different contexts.

## Thinking Tokens-first

Historically, it’s been easy to think first in terms of UI. A designer makes a
mockup of a website, mobile app, or even a car app for a smart car. And the
engineering team has to work within the constraints of the platform to match the
UI.

Though no matter what, you will have to end up writing platform-specific code,
shifting thinking from a UI-first approach to a Tokens-first approach means
you’re first identifying what elements of the UI are reusable, and seeing how
you can save that work across platforms without having to reinvent the wheel
each time. It lets engineering teams only focus on the code that’s
platform-specific, and lets the design team focus on the common patterns and
elements to apply to all platforms.

If you’re able to centralize and extract these tokens well, you not only save
work in the long run. You also build products that evolve with your design
system.
