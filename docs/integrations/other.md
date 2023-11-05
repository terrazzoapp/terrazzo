---
title: Other
---

# Other Integrations

The following integrations are planned, but aren’t ready yet:

- Elixir
- PHP
- Python
- Ruby

## Consuming JSON

If your integration isn’t supported (or isn’t planned), you can use the [JSON plugin](/integrations/json) to pull the tokens into your project. JSON is a universal language, and can be easily parsed in just about every language.

Even though [`tokens.json` manifests](/guides/tokens) are written in JSON, Cobalt’s JSON plugin performs extra layers of work to make tokens even easier to consume:

- Syntax errors are caught
- All aliases are resolved
- Token values are normalized wherever possible (e.g. colors converted to hex)

[Read JSON plugin docs](/integrations/json)
