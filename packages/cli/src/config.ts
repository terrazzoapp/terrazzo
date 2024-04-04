import type { ResolvedConfig, Config, LintRule } from '@cobalt-ui/core';
import fs from 'node:fs';
import mod from 'node:module';
import { fileURLToPath, URL } from 'node:url';

const require = mod.createRequire(`file://${process.cwd()}`);
const TRAILING_SLASH_RE = /\/*$/;

export async function init(userConfig: Config, cwd: URL): Promise<ResolvedConfig> {
  let config = { ...(userConfig as any) } as ResolvedConfig;

  // config.tokens
  // default
  if (userConfig.tokens === undefined) {
    config.tokens = ['./tokens.json' as any]; // will be normalized in next step
  } else if (typeof userConfig.tokens === 'string') {
    config.tokens = [userConfig.tokens as any]; // will be normalized in next step
  } else if (Array.isArray(userConfig.tokens)) {
    config.tokens = [];
    for (const file of userConfig.tokens) {
      if (typeof file === 'string') {
        config.tokens.push(file as any); // will be normalized in next step
      } else {
        throw new Error(`[config] tokens must be array of strings, encountered unexpected path "${file}"`);
      }
    }
  } else {
    throw new Error(`[config] tokens must be string or array of strings, received ${typeof userConfig.tokens}`);
  }
  // normalize
  for (let i = 0; i < config.tokens.length; i++) {
    const filepath = config.tokens[i] as any as string;
    const isRemote = filepath.startsWith('//') || filepath.startsWith('http:') || filepath.startsWith('https:');
    if (isRemote) {
      try {
        config.tokens[i] = new URL(filepath);
      } catch {
        throw new Error(`[config] invalid URL "${filepath}"`);
      }
    } else {
      let tokensPath = new URL(filepath, cwd);
      if (fs.existsSync(tokensPath)) {
        config.tokens[i] = tokensPath;
      }
      // fallback: if this is looking for the default file, autodetect tokens.yaml
      else if (i === 0 && filepath === './tokens.json') {
        tokensPath = new URL('./tokens.yaml', cwd);
        if (fs.existsSync(tokensPath)) {
          config.tokens[i] = tokensPath;
        } else {
          throw new Error(`Can’t resolve ${config.tokens[i]}. Does the file or URL exist?`);
        }
      }
      // otherwise, attempt Node resolution (sometimes it do be like that)
      else {
        const nodeResolved = require.resolve(filepath, { paths: [fileURLToPath(cwd), process.cwd(), import.meta.url] });
        if (!fs.existsSync(nodeResolved)) {
          throw new Error(`Can’t locate "${userConfig.tokens}". Does the path exist?`);
        }
        config.tokens[i] = new URL(`file://${nodeResolved}`);
      }
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
    // note: always add trailing slash so URL treats it as a directory
    config.outDir = new URL(userConfig.outDir.replace(TRAILING_SLASH_RE, '/'), cwd);
  }

  // config.plugins
  // validate
  if (userConfig.plugins !== undefined) {
    if (!Array.isArray(userConfig.plugins)) {
      throw new Error(`[config] plugins must be array, received ${typeof userConfig.plugins}`);
    }
    if (!userConfig.plugins.length) {
      throw new Error('[config] plugins are empty');
    }
    for (let n = 0; n < userConfig.plugins.length; n++) {
      const plugin = userConfig.plugins[n];
      if (typeof plugin !== 'object') {
        throw new Error(`[plugin#${n}] invalid: expected output plugin, received ${JSON.stringify(plugin)}`);
      }
      if (!plugin.name) {
        throw new Error(`[plugin#${n}] invalid plugin: missing "name"`);
      }
      if (!plugin.config && !plugin.lint && !plugin.build) {
        // eslint-disable-next-line no-console
        console.warn(`[${plugin.name}] empty plugin: doesn’t lint or build`);
      }
    }
  }

  // send resolved config to all plugins (pass original reference; don’t clone)
  if (Array.isArray(config.plugins) && config.plugins.length) {
    for (const plugin of config.plugins) {
      if (typeof plugin.config === 'function') {
        const newConfig = plugin.config(config); // if a plugin modified the config, alloawaitw it to
        if (newConfig) {
          config = newConfig;
        }
      }
    }
  }

  // lint options
  if ('lint' in config && config.lint !== undefined) {
    if (config.lint === null || typeof config.lint !== 'object' || Array.isArray(config.lint)) {
      throw new Error(`[config] "lint" must be an object`);
    }

    if (!(('build' in config.lint) as any)) {
      config.lint.build = { enabled: true };
    }
    if ('enabled' in config.lint.build && config.lint.build.enabled !== undefined) {
      if (typeof config.lint.build.enabled !== 'boolean') {
        throw new Error(`[config] "lint.build.enabled" expected boolean, received ${typeof config.lint.build}`);
      }
    } else {
      config.lint.build.enabled = true;
    }

    if ('rules' in config.lint && config.lint.rules !== undefined) {
      if (config.lint.rules === null || typeof config.lint.rules !== 'object' || Array.isArray(config.lint.rules)) {
        throw new Error(`[config] "lint.rules" must be an object`);
      }

      for (const id in config.lint.rules) {
        if (typeof id !== 'string') {
          throw new Error(`[config] "lint.rules" expects string keys, received ${typeof id}`);
        }
        const value = config.lint.rules[id] as unknown;
        let severity: number | string = 'off';
        let options: unknown | undefined;
        if (typeof value === 'number' || typeof value === 'string') {
          severity = value;
        } else if (Array.isArray(value)) {
          severity = value[0];
          options = value[1];
        } else if (value !== undefined) {
          throw new Error(
            `[config] lint rule "${id}" invalid syntax. Expected string | number | array, received ${typeof value}`,
          );
        }
        config.lint.rules[id] = { id, severity: severity as LintRule['severity'], options };
        if (typeof severity === 'number') {
          if (severity !== 0 && severity !== 1 && severity !== 2) {
            throw new Error(
              `[config] lint rule "${id}" invalid number \`${severity}\`. Specify \`0\` for 'off', \`1\` for 'warn', or \`2\` for 'error'.`,
            );
          }
          config.lint.rules[id]!.severity = (['off', 'warn', 'error'] as const)[severity];
        } else if (typeof severity === 'string') {
          if (severity !== 'off' && severity !== 'warn' && severity !== 'error') {
            throw new Error(
              `[config] lint rule "${id}" invalid string \`${severity}\`. Specify 'off', 'warn', or 'error'.`,
            );
          }
        } else if (value !== null) {
          throw new Error(`[config] lint rule "${id}" expected string or number, received ${typeof value}`);
        }
      }
    }
  } else {
    config.lint = {
      build: { enabled: true },
      rules: {},
    };
  }

  // token type options
  for (const tokenType of ['color']) {
    // normalize
    (config as any)[tokenType] = { ...((userConfig as any)[tokenType] ?? {}) };
  }

  return config;
}
