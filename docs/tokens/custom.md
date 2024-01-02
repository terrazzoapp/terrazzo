---
title: Custom Tokens
---

# Custom Tokens

Any token type currently not part of the Design Token Community Group format (DTCG) can be created as a custom token.

However, most Cobalt plugins will throw an error on an unknown type unless you write code that can handle it. The CSS and Sass plugins have a `transformer` option for you to do this.

If your custom types are complex enough, you can also [write your own plugin](/advanced/plugin-api) for Cobalt (which is easier than some may think!).

_Should a type be added? [Suggest it!](https://github.com/design-tokens/community-group")_
