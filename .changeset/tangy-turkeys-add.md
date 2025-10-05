---
"@terrazzo/token-tools": minor
"@terrazzo/parser": minor
"@terrazzo/cli": minor
---

⚠️ Breaking change: the following token types have more strict requirements about all properties being present:

- Border
- Transition
- Typography

These behaviors may be opted out individually by adjusting the new lint rules ([see documentation](https://terrazzo.app/docs/cli/lint/)).
