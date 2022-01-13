import type { Config, Plugin, UserConfig } from '@cobalt-ui/core';

export async function init(userConfig: UserConfig): Promise<Config> {
  async function loadDefaultPlugins(): Promise<Plugin[]> {
    return await Promise.all(['@cobalt-ui/plugin-json'].map((spec) => import(spec).then((m) => m.default())));
  }

  let config = { ...(userConfig as any) } as Config;

  // partial config: fill in defaults
  for (const k of ['outDir', 'plugins', 'tokens']) {
    switch (k) {
      case 'outDir': {
        // default
        if (config[k] === undefined) {
          config[k] = new URL('./tokens/', `file://${process.cwd()}/`);
          break;
        }
        // validate
        if (typeof config[k] !== 'string') throw new Error(`[config] ${k} must be string, received ${typeof config[k]}`);
        // normalize
        config[k] = new URL(config[k], `file://${process.cwd()}/`);
        break;
      }
      case 'plugins': {
        // default
        if (config[k] === undefined) {
          config[k] = await loadDefaultPlugins();
          break;
        }
        // validate
        if (!Array.isArray(config[k])) throw new Error(`[config] ${k} must be array, received ${typeof config[k]}`);
        if (!config[k].length) throw new Error(`[config] plugins are empty`);
        for (let n = 0; n < config[k].length; n++) {
          if (typeof config[k][n] !== 'object') throw new Error(`[plugin#${n}] invalid: expected output plugin, received ${JSON.stringify(config[k][n])}`);
          if (!config[k][n].name) throw new Error(`[plugin#${n}] invalid plugin: missing "name"`);
          if (typeof config[k][n].build !== 'function') throw new Error(`[${config[k][n].name}] missing "build" function`);
        }
        break;
      }
      case 'tokens': {
        // default
        if (config[k] === undefined) {
          config[k] = new URL('./tokens.json', `file://${process.cwd()}/`);
          break;
        }
        // validate
        if (typeof config[k] !== 'string') throw new Error(`[config] ${k} must be string, received ${typeof config[k]}`);
        // normalize
        config[k] = new URL(config[k], `file://${process.cwd()}/`);
        break;
      }
    }
  }

  return config;
}
