# @terrazzo/gallery

Tokens.json editor and viewer.

## Setup

```sh
pnpm
```

```tsx
import Gallery from '@terrazzo/gallery';
import tokens from './tokens.json' assert { type: json };

<Gallery
  tokens={tokens}
  onUpdate={async (newTokens) => {
    // do something…
  }}
/>;
```
