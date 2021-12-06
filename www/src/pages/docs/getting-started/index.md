---
title: Getting Started
layout: ../../../layouts/docs.astro
---

# Getting Started

To start, you’ll need to gather all your tokens before you can use them in code. This is known as a `tokens.yaml` file. You can copy and paste the following into a `tokens.yaml` file in the root of your project. Colors are a good place to start:

```yaml
name: My Tokens # Change this!
tokens:
  color:
    type: group
    tokens:
      black:
        type: token
        value:
          default: '#000000'
      # Change or add additional colors
```

After creating a starter `tokens.yaml` file, you can fill in the remaining values manually yourself, or automatically by connecting it to Figma.

## Method 1: Manual

If your tokens are scattered about and live in different sources, you’ll need to consolidate them yourself into `tokens.yaml`:

```diff
  name: My Tokens
  tokens:
    color:
      type: group
      tokens:
        black:
          type: token
          value:
            default: '#000000'
+       blue:
+         type: token
+         value:
+           default: '#0969da'
+   type:
+     type: group
+     tokens:
+       family:
+         type: group
+         tokens:
+           base:
+             type: token
+             value:
+               default: GT America
```

You can add as many tokens as you’d like, organize them into groups, and even add user-friendly names and descriptions.

👉 **[View `tokens.yaml` guide][tokens.yaml]**

## Method 2: Figma

[Figma] is a cloud-based design tool that’s taking digital design by storm. Because it’s cloud-based, that means `tokens.yaml` can be updated using Figma at any time.

Unlike tools like [Diez] that require you to start from an existing template and require you stay within very specific formats, Cobalt places no such restrictions on you. You can organize your Figma files as you please, and even use pre-existing Figma
files without changes. However, this flexibility comes at a trade-off: you’ll have to tell Cobalt where your tokens live in your Figma files.

👉 **[View Figma setup guide][figma-guide]**

[diez]: https://diez.org/
[figma]: https://figma.com
[figma-guide]: /docs/getting-started/figma
[tokens.yaml]: /docs/reference/schema
