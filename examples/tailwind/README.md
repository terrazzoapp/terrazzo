# Tailwind Plugin

Example of using [`@cobalt-ui/plugin-tailwind`](../../packages/plugin-tailwind) with tokens (GitHub Primer, in this example).

- The plugin generates `./tokens/tailwind-tokens.js` when running `co build`
- Dummy content lives in `src/index.html` just for Tailwind scanning
- Running `tailwind build` generates `tailwind.css`, which uses values pulled from `tokens.json`
