---
"@terrazzo/parser": patch
---

`parse()` now decodes a `Buffer` (or any `Uint8Array`) `src` as UTF-8, so reading a token file with `fs.readFile(filename)` and no encoding — as the JS API docs show — finds the same tokens as `fs.readFile(filename, 'utf8')`.

Previously a byte source fell through to the “JSON-serializable object” branch and was stringified to `{"type":"Buffer","data":[…]}`. That happens to be valid JSON and a valid empty DTCG group, so the parse reported success with zero tokens and no errors or warnings, and plugins went on to write empty output files.
