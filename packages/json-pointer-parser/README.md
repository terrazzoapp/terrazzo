# @terrazzo/json-pointer-parser

Itty-bitty library for parsing [JSON pointers](https://datatracker.ietf.org/doc/html/rfc6901). No resolving, no dereferencing, no CLI. Universal ESM.

## Comparison

| Package                             |      Size | Ops/s | Speed | ESM? |
| :---------------------------------- | --------: | ----: | ----: | :--: |
| @terrazzo/json-pointer-parser       |  `0.4 kB` |  9.3M |  100% |  ✅  |
| @apidevtools/json-schema-ref-parser | `82.2 kB` |  2.3M |   25% |      |

_Note: for every package tested, we’re comparing against the lowest-level method that does equivalent work. We’re not comparing apples to oranges and testing extraneous codepaths._
