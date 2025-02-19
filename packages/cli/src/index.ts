import { createRequire } from 'node:module';
import { type Config, type ConfigInit, defineConfig as defineConfigCore } from '@terrazzo/parser';
import { cwd } from './shared.js';

const require = createRequire(cwd);

export type { Command, Flags } from './shared.js';

// wrap defineConfig from @terrazzo/parser and add Node.js resolution
export function defineConfig(config: Config): ConfigInit {
  const normalizedConfig: Config = { ...config }; // note: we only need a shallow copy because we’re only mutating top-level `tokens`

  // Resolve tokens from npm modules, if any
  if (typeof normalizedConfig.tokens === 'string' || Array.isArray(normalizedConfig.tokens)) {
    normalizedConfig.tokens = (
      Array.isArray(normalizedConfig.tokens) ? normalizedConfig.tokens : [normalizedConfig.tokens]
    ).map((tokenPath) => {
      if (tokenPath.startsWith('.') || /^(https?|file):\/\//i.test(tokenPath)) {
        return tokenPath;
      }
      try {
        return new URL(`file://${require.resolve(tokenPath)}`);
      } catch (err) {
        console.error(err);
        // this will throw an error if Node couldn’t automatically resolve it,
        // which will be true for many token paths. We don’t need to surface
        // that error; it’ll get its own error down the line if it’s a bad path.
        return tokenPath;
      }
    }) as string[];
  }

  return defineConfigCore(normalizedConfig, { cwd });
}
