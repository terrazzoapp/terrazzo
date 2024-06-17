import { type Config, defineConfig as defineConfigCore, type ConfigInit } from '@terrazzo/parser';

export function defineConfig(config: Config): ConfigInit {
  return defineConfigCore(config, { cwd: new URL(`file://${process.cwd()}/`) });
}
