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
    black:
      type: color
      value: "#000000"
```

After creating a starter `tokens.yaml` file, you can fill in the remaining values manually yourself, or automatically by connecting it to Figma.

## Method 1: Manual

If your tokens are scattered about and live in different sources, you’ll need to consolidate them yourself into `tokens.yaml`:

```diff
  name: My Tokens
  tokens:
    color:
      black:
        type: color
        value: "#000000"
+     blue:
+       type: color
+       value: "#0969da"
+   font:
+     family:
+       body:
+         type: font
+         value: GT America
```

You can add as many tokens as you’d like, organize them into groups, and even add user-friendly names and descriptions.

👉 **[View `tokens.yaml` guide][tokens.yaml]**

## Method 2: Figma

[Figma] is a cloud-based design tool that’s taking digital design by storm. Because it’s cloud-based, that means `tokens.yaml` can be updated using Figma at any time.

Unlike tools like [Diez] that require you to start from an existing template and require you stay within very specific formats, Cobalt places no such restrictions on you. You can organize your Figma files as you please, and even use pre-existing Figma
files without changes. However, this flexibility comes at a trade-off: you’ll have to tell Cobalt where your tokens live in your Figma files.

👉 **[View Figma setup guide][figma-guide]**

## A note on YAML

You may be familiar with [YAML]; you may not. A goal of this project is to help people feel comfortable with YAML even if they haven’t used it before. Hopefully, there are enough examples here to copy & paste into your own `tokens.yaml` file to give you a
good start.

YAML is designed to be friendly and user-readable, which is why it was chosen for this spec. But it’s also meant to handle structured data, so while friendly it’s strict enough to be used as a way to store all types of valus (oh, and don’t worry about what
the [acronymn means][yaml-name]; it’s silly). There are many tutorials and guides on how to write YAML [such as this tutorial][yaml], so this section won’t be exhaustive. But here are a few tips for dealing with `tokens.yaml` specifically:

- **Quotes**: YAML overall is _really_ good at figuring out what data type something is. But colors like `"#2680eb"` are the exception. In YAML a `#` character starts a comment, so you’ll always need quotes around it. Also, `"#2680eb"` and `'#2680eb'` are
  the same, so use whichever you prefer).
- **Aliasing**: sometimes you want to reference another value, like so: `$color.red`. But what if, for some reason, you actually meant to type that `$`? You can place a backslash at the beginning to keep that literal value: `\$color.red`.

[diez]: https://diez.org/
[figma]: https://figma.com
[figma-guide]: /docs/getting-started/figma
[tokens.yaml]: /docs/reference/schema
[yaml]: https://www.commonwl.org/user_guide/yaml/
[yaml-name]: https://en.wikipedia.org/wiki/YAML#History_and_name
