---
"@terrazzo/parser": patch
---

Stop a group’s `$type`, `$deprecated`, and `$description` cascading into a sibling group whose name merely starts with the same characters, e.g. `size.font` leaking `fontFamily` into `size.font-scale`.

Previously the cascade picked ancestors with a raw string prefix match on the group’s JSON pointer, so any group whose name began with a sibling’s name inherited that sibling’s properties. A `dimension` token under `size.font-scale` ended up with `$type: fontFamily` and failed validation, aborting the build.
