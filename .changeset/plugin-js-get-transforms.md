---
"@terrazzo/plugin-js": minor
---

Register a `transform` hook on plugin-js so each token gets a transform entry under `format: "js"`. The transform's `localID` matches the token id; the `value` and `meta['token-listing'].name` carry a JS access expression like `tokens["color.brand.500"]`. This aligns plugin-js with the other format plugins (css/sass/swift/tailwind/vanilla-extract/css-in-js) which all register transforms, and lets plugin-token-listing populate the `js` row of its per-platform `names` map by name lookup the same way it does for the other plugins.

No build-output change; the existing `build` hook is unchanged. Consumers not using token-listing see no functional difference.
