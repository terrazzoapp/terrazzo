---
title: Project Goals
layout: ../../../layouts/docs.astro
---

# Project Goals

TODO

## FAQ

#### Why YAML?

YAML is easy-to-read, and is a universal data format that almost every programming language can understand. Many design token systems are stored in JavaScript, which can be incredibly-limiting and can have impacts on tooling.

By relying on YAML instead of JavaScript, Cobalt’s internals are replaceable. Although this library uses Node.js at the moment, it doesn’t have to stick to Node.js forever. Using YAML means Cobalt can be completely rewritten and improved without affecting
users’ token systems.

Understandably, though, YAML isn’t easy to edit for everyone! That’s why the [Cobalt Editor](https://cobalt-ui.pages.dev/editor) exists to help peole get started.

Further, YAML is preferred over JSON here because it supports comments and it’s easier to read.

#### What does the name “Cobalt” mean?

The name ”cobalt” has several meanings. Historically, the blue pigment cobalt (along with ultramarine) has been one of the most elusive and rare colors in painting. But with the commodification of pigments and advancements in paint storage, cobalt is now
widely available to all, and in the process, revolutionized art. Blue pigment was the last “missing piece“ in paint colors. In a similar sense, having an easy-to-use system to manage tokens aims to be the “missing piece” to design management for
applications.

Secondly, cobalt is an element on the periodic table. It’s reflective of how design tokens are in a sense the “elements“ of a design system.

Thirdly, cobalt blue is a reference to a “blueprint”—the founding sketch of your design.
