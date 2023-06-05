import type {ResolvedConfig, Config} from '@cobalt-ui/core';
import fs from 'node:fs';
import mod from 'node:module';
import {fileURLToPath, URL} from 'node:url';

const require = mod.createRequire(`file://${process.cwd()}`);

export async function init(userConfig: Config, cwd: URL): Promise<ResolvedConfig> {
  let config = {...(userConfig as any)} as ResolvedConfig;

  // config.tokens
  // default
  if (userConfig.tokens === undefined) {
    config.tokens = new URL('./tokens.json', cwd);
  }
  // validate
  else if (typeof userConfig.tokens !== 'string') {
    throw new Error(`[config] tokens must be string, received ${typeof userConfig.tokens}`);
  }
  // normalize
  else {
    const tokensPath = new URL(config.tokens as any, cwd);
    if (fs.existsSync(tokensPath)) {
      config.tokens = tokensPath;
    }
    // otherwise, try Node resolution
    else {
      const nodeResolved = require.resolve(userConfig.tokens, {paths: [fileURLToPath(cwd), process.cwd(), import.meta.url]});
      if (!fs.existsSync(nodeResolved)) throw new Error(`Can’t locate "${userConfig.tokens}". Does the path exist?`);
      config.tokens = new URL(`file://${nodeResolved}`);
    }
  }

  // config.outDir
  // default
  if (userConfig.outDir === undefined) {
    config.outDir = new URL('./tokens/', cwd);
  }
  // validate
  else if (typeof userConfig.outDir !== 'string') {
    throw new Error(`[config] outDir must be string, received ${typeof userConfig.outDir}`);
  }
  // normalize
  else {
    config.outDir = new URL(userConfig.outDir, cwd);
  }

  // config.plugins
  // validate
  if (userConfig.plugins !== undefined) {
    if (!Array.isArray(userConfig.plugins)) throw new Error(`[config] plugins must be array, received ${typeof userConfig.plugins}`);
    if (!userConfig.plugins.length) throw new Error(`[config] plugins are empty`);
    for (let n = 0; n < userConfig.plugins.length; n++) {
      if (typeof userConfig.plugins[n] !== 'object') throw new Error(`[plugin#${n}] invalid: expected output plugin, received ${JSON.stringify(userConfig.plugins[n])}`);
      if (!userConfig.plugins[n].name) throw new Error(`[plugin#${n}] invalid plugin: missing "name"`);
      if (typeof userConfig.plugins[n].build !== 'function') throw new Error(`[${userConfig.plugins[n].name}] missing "build" function`);
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
