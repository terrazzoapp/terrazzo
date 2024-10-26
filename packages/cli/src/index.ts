import { type Config, type ConfigInit, defineConfig as defineConfigCore } from '@terrazzo/parser';

export function defineConfig(config: Config): ConfigInit {
  return defineConfigCore(config, { cwd: new URL(`file://${process.cwd()}/`) });
}
