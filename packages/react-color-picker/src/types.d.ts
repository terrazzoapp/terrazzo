import 'react';

/* oxlint-disable consistent-indexed-object-style */

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
