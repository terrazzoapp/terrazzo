---
"@terrazzo/plugin-swift": patch
---

Fix `No color space found with id = "srgb"` crash. The plugin's `colorjs.io` dependency can resolve to a separate module instance from the one other packages (e.g. `@terrazzo/token-tools`) register color spaces into, leaving its own instance's registry empty. The plugin now explicitly registers the color spaces it needs, rather than relying on another package having already done so.
