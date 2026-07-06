import 'react';

declare module 'react' {
  type CSSProperties = Record<`--${string}`, string | number | undefined>;
}
