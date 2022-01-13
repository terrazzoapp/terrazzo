---
title: Getting Started
layout: ../../../layouts/docs.astro
---

# Getting Started

To start, you’ll need to gather all your tokens before you can use them in code. This is known as a `tokens.json` file. You can copy and paste the following into a `tokens.json` file in the root of your project. Colors are a good place to start:

```json
{
  "name": "My Tokens",
  "tokens": {
    "color": {
      "black": {
        "type": "color",
        "value": "#000000"
      }
    }
  }
}
```

After creating a starter `tokens.json` file, you can fill in the remaining values manually yourself, or automatically by connecting it to Figma.

## Method 1: Manual

If your tokens are scattered about and live in different sources, you’ll need to consolidate them yourself into `tokens.json`:

```diff
  {
    "name": "My Tokens",
    "tokens": {
      "color": {
        "black": {
          "type": "color",
          "value": "#000000"
        },
+       "blue": {
+         "type": "color",
+         "value": "#0969da"
+       }
+     },
+     "font": {
+       "family": {
+         "body": {
+           "type": "font",
+           "value": "GT America"
+         }
+       }
+     }
    }
  }
```

You can add as many tokens as you’d like, organize them into groups, and even add user-friendly names and descriptions.

👉 **[View `tokens.json` guide][tokens.json]**

## Method 2: Figma

[Figma] is a cloud-based design tool that’s taking digital design by storm. Because it’s cloud-based, that means `tokens.json` can be updated using Figma at any time.

Unlike tools like [Diez] that require you to start from an existing template and require you stay within very specific formats, Cobalt places no such restrictions on you. You can organize your Figma files as you please, and even use pre-existing Figma
files without changes. However, this flexibility comes at a trade-off: you’ll have to tell Cobalt where your tokens live in your Figma files.

👉 **[View Figma setup guide][figma-guide]**

[diez]: https://diez.org/
[figma]: https://figma.com
[figma-guide]: /docs/getting-started/figma
[tokens.json]: /docs/reference/schema
