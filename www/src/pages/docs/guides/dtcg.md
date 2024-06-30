---
title: DTCG Tokens
layout: ../../../layouts/docs.astro
---

# DTCG Tokens

The <abbr title="Design Tokens Community Group">DTCG</abbr> format is a [W3C Community Group specification](https://www.designtokens.org/) started in 2020 and aims to outline a standard, universal design token format that works for all forms of digital design (including web, print, native apps, and beyond).

If you’re familiar with the “what,” “why,” and “how” of the DTCG spec you don’t need to read this guide. This will cover some brief history over how the spec came to be, and what problems it solves for those working with design tokens.

## Write once, use everywhere

The design philosophy of the DTCG format is **declare tokens once and use them everywhere.** This aligns with the goal of using design tokens in the first place: encoding design decisions in a portable format to be used across multiple software targets.

But since different platforms have different requirements about how colors are used (e.g. Swift has system colors available, while CSS does not), managing these tokens across platforms becomes impossible to keep up with at scale.

[TODO]
