import type { ResolvedConfig, Config } from '@cobalt-ui/core';

export async function init(userConfig: Config): Promise<ResolvedConfig> {
  let config = { ...(userConfig as any) } as ResolvedConfig;

  // partial config: fill in defaults
  for (const k of ['outDir', 'plugins', 'tokens', 'figma']) {
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
        if (config[k] === undefined) {
          config[k] = new URL('./tokens.json', `file://${process.cwd()}/`);
        } else if (typeof config[k] === 'string') {
          config[k] = new URL(config[k], `file://${process.cwd()}/`);
        } else {
          throw new Error(`[config] ${k} must be string, received ${typeof config[k]}`);
        }
        break;
      }
      case 'figma': {
        if (config.figma === undefined) break;
        if (!config.figma.docs || !Array.isArray(config.figma.docs) || !config.figma.docs.length)
          throw new Error(`No Figma docs found in config (nothing to sync)`);
        for (let n = 0; n < config.figma.docs.length; n++) {
          const doc = config.figma.docs[n];
          if (!doc.url) throw new Error(`Figma doc [${n}] missing url`);
          if (!Array.isArray(doc.tokens) || !doc.tokens.length) throw new Error(`Figma doc [${n}] missing array of tokens`);
          for (const token of doc.tokens) {
            // required properties
            if (!token.token) throw new Error(`Figma doc [${n}]: all tokens must have "token" property`);
            if (!token.type) throw new Error(`Figma doc [${n}]: ${token.token}: missing "type" property`);
            if (!token.style && !token.component) throw new Error(`Figma doc [${n}]: ${token.token}: must reference a "style" or "component"`);
            if (token.style && token.component) throw new Error(`Figma doc [${n}]: ${token.token}: cannot reference both "style" AND "component" (choose one)`);

            // file token
            if (token.type === 'file' && token.style) throw new Error(`Figma doc [${n}]: ${token.token}: file must be a component`);
            if (token.type === 'file' && !token.filename) throw new Error(`Figma doc [${n}]: ${token.token}: file tokens must specify "filename"`);
          }
        }
      }
    }
  }

  // send resolved config to all plugins
  if (Array.isArray(config.plugins) && config.plugins.length) {
    for (const plugin of config.plugins) {
      if (typeof plugin.config === 'function') {
        plugin.config(config);
      }
    }
  }

  return config;
}
