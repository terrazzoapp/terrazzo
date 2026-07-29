---
"@terrazzo/parser": patch
---

`parse()` now decodes a byte `src` as UTF-8 — a `Buffer`, any typed array, a `DataView` or an `ArrayBuffer` — so reading a token file with `fs.readFile(filename)` and no encoding, as the JS API docs show, finds the same tokens as `fs.readFile(filename, 'utf8')`. `(await fetch(url)).arrayBuffer()` works the same way.

Previously a byte source fell through to the “JSON-serializable object” branch and was stringified: `{"type":"Buffer","data":[…]}` for a `Buffer`, `{}` for an `ArrayBuffer`. Both are valid JSON and both are valid empty DTCG groups, so the parse reported success with zero tokens and no errors or warnings, and plugins went on to write empty output files.
