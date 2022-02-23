import type { ResolvedConfig, Config } from '@cobalt-ui/core';
import fs from 'fs';
import mod from 'module';

const require = mod.createRequire(`file://${process.cwd()}`);

export async function init(userConfig: Config): Promise<ResolvedConfig> {
  let config = { ...(userConfig as any) } as ResolvedConfig;

  // config.tokens
  // default
  if (userConfig.tokens === undefined) {
    config.tokens = new URL('./tokens.json', `file://${process.cwd()}/`);
  }
  // validate
  else if (typeof userConfig.tokens !== 'string') {
    throw new Error(`[config] tokens must be string, received ${typeof userConfig.tokens}`);
  }
  // normalize
  else {
    const tokensPath = new URL(config.tokens, `file://${process.cwd()}/`);
    if (fs.existsSync(tokensPath)) {
      config.tokens = tokensPath;
    }
    // otherwise, try Node resolution
    else {
      const nodeResolved = require.resolve(userConfig.tokens, { paths: [process.cwd(), import.meta.url] });
      if (!fs.existsSync(nodeResolved)) throw new Error(`Can’t locate "${userConfig.tokens}". Does the path exist?`);
      config.tokens = new URL(`file://${nodeResolved}`);
    }
  }

  // config.outDir
  // default
  if (userConfig.outDir === undefined) {
    config.outDir = new URL('./tokens/', `file://${process.cwd()}/`);
  }
  // validate
  else if (typeof userConfig.outDir !== 'string') {
    throw new Error(`[config] outDir must be string, received ${typeof userConfig.outDir}`);
  }
  // normalize
  else {
    config.outDir = new URL(userConfig.outDir, `file://${process.cwd()}/`);
  }

  // config.plugins
  // validate
  if (userConfig.plugins !== undefined) {
    if (!Array.isArray(userConfig.plugins)) throw new Error(`[config] plugins must be array, received ${typeof userConfig.plugins}`);
    if (!userConfig.plugins.length) throw new Error(`[config] plugins are empty`);
    for (let n = 0; n < userConfig.plugins.length; n++) {
      if (typeof userConfig.plugins[n] !== 'object')
        throw new Error(`[plugin#${n}] invalid: expected output plugin, received ${JSON.stringify(userConfig.plugins[n])}`);
      if (!userConfig.plugins[n].name) throw new Error(`[plugin#${n}] invalid plugin: missing "name"`);
      if (typeof userConfig.plugins[n].build !== 'function') throw new Error(`[${userConfig.plugins[n].name}] missing "build" function`);
    }
  }

  // config.figma
  // validate & nromalize
  if (userConfig.figma !== undefined) {
    if (!userConfig.figma.docs || !Array.isArray(userConfig.figma.docs) || !userConfig.figma.docs.length)
      throw new Error(`No Figma docs found in config (nothing to sync)`);
    for (let n = 0; n < userConfig.figma.docs.length; n++) {
      const doc = userConfig.figma.docs[n];
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

  // send resolved config to all plugins (pass original reference; don’t clone)
  if (Array.isArray(config.plugins) && config.plugins.length) {
    for (const plugin of config.plugins) {
      if (typeof plugin.config === 'function') {
        const newConfig = plugin.config(config); // if a plugin modified the config, alloawaitw it to
        if (newConfig) config = newConfig;
      }
    }
  }

  return config;
}
