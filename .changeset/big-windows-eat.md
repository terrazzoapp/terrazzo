---
"@terrazzo/token-tools": minor
"@terrazzo/parser": minor
"@terrazzo/cli": minor
---

⚠️ Breaking change; DTCG 2nd Editors draft format will throw errors by default. This means converting all colors and dimensions to the new object format.

Though this is a breaking change in default behavior, you can opt back into the old behavior by adjusting your config’s lint settings. See https://terrazzo.app/docs/cli/lint/.

List of changes:

- **dimension**: object notation (`{ value: 16, unit: 'px' }`) required
- **dimension**: `em` units no longer allowed
- **dimension**: `{ $value: 0 }` no longer allowed
- **duration**: object notation (`{ value: 100, unit: 'ms' }`) required
- **dimension**: `{ $value: 0 }` no longer allowed
- **typography**: `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, and `letterSpacing` are all required at a minimum (additional properties are still allowed)
