---
'@cobalt-ui/plugin-sass': minor
---

Fix collision of mode names if a user has a mode called `"default"`, changing the internal selector to `"."` (a single dot).

`"."` will be used more often in the upcoming [2.0 API](https://github.com/drwpow/cobalt-ui/issues/201), chosen because it’s easy to type/reference, uses illegal characters (therefore consumers can’t use it, but internally we know what it means), and also because it matches [Node’s ESM implementation for the default import](https://nodejs.org/docs/latest/api/esm.html#resolution-algorithm-specification), so it will be familiar/expected for some developers.
