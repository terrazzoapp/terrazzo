# @terrazzo/token-lab

Tokens.json editor and viewer.

> [!WARNING]
> This is a work in progress.

## Setup

```sh
pnpm i
```

```tsx
import TokenLab from "@terrazzo/token-lab";
import resolver from "./my-ds.resolver.json" with { type: "json" };

<TokenLab resolver={resolver} />;
```
