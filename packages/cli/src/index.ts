import { type Config, type ConfigInit, defineConfig as defineConfigCore } from '@terrazzo/parser';
import { cwd } from './shared.js';

export type { Command, Flags } from './shared.js';

export function defineConfig(config: Config): ConfigInit {
  return defineConfigCore(config, { cwd });
}
