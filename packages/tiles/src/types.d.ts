import 'react';

declare module '*.css';

declare module 'react' {
  type CSSProperties = Record<`--${string}`, string | number | undefined>;
}
