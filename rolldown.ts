import { readFileSync } from 'node:fs';
import { merge } from 'merge-anything';
import type { RolldownOptions } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

export const defineConfig = (options: RolldownOptions): RolldownOptions => {
  const pkg = JSON.parse(readFileSync(new URL('package.json', `file://${process.cwd()}/`), 'utf8'));
  return merge(
    {
      platform: 'browser',
      plugins: [dts({ resolve: true })],
      external: [...Object.keys(pkg.peerDependencies ?? {}), ...Object.keys(pkg.dependencies ?? {})].flatMap((k) => [
        k,
        new RegExp(`^${k}/`),
      ]),
      output: {
        dir: 'dist',
        format: 'es',
        sourcemap: true,
      },
    },
    options,
  );
};
