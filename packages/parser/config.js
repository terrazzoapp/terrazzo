import { merge } from 'merge-anything';
import coreLintPlugin from './lint/plugin-core/index.js';
import Logger from './logger.js';

const TRAILING_SLASH_RE = /\/*$/;

/**
 * Validate and normalize a config
 * @param {Config} rawConfig
 * @param {object} options
 * @param {Logger} options.logger
 * @param {URL} options.cwd
 */
export default function defineConfig(rawConfig, { logger = new Logger(), cwd } = {}) {
  const configStart = performance.now();

  if (!cwd) {
    logger.error({ label: 'core', message: 'defineConfig() missing `cwd` for JS API' });
  }

  logger.debug({ group: 'parser', task: 'config', message: 'Start config validation' });

  const config = merge({}, rawConfig);

  // config.tokens
  if (rawConfig.tokens === undefined) {
    config.tokens = ['./tokens.json']; // will be normalized in next step
  } else if (typeof rawConfig.tokens === 'string') {
    config.tokens = [rawConfig.tokens]; // will be normalized in next step
  } else if (Array.isArray(rawConfig.tokens)) {
    config.tokens = [];
    for (const file of rawConfig.tokens) {
      if (typeof file === 'string' || file instanceof URL) {
        config.tokens.push(file); // will be normalized in next step
      } else {
        logger.error({
          label: 'config.tokens',
          message: `Expected array of strings, encountered ${JSON.stringify(file)}`,
        });
      }
    }
  } else {
    logger.error({
      label: 'config.tokens',
      message: `Expected string or array of strings, received ${typeof rawConfig.tokens}`,
    });
  }
  for (let i = 0; i < config.tokens.length; i++) {
    const filepath = config.tokens[i];
    if (filepath instanceof URL) {
      continue; // skip if already resolved
    }
    try {
      config.tokens[i] = new URL(filepath, cwd);
    } catch (err) {
      logger.error({ label: 'config.tokens', message: `Invalid URL ${filepath}` });
    }
  }

  // config.outDir
  if (config.outDir instanceof URL) {
    // noop
  } else if (typeof config.outDir === 'undefined') {
    config.outDir = new URL('./tokens/', cwd);
  } else if (typeof config.outDir !== 'string') {
    logger.error({ label: 'config.outDir', message: `Expected string, received ${JSON.stringify(config.outDir)}` });
  } else {
    config.outDir = new URL(config.outDir, cwd);
    // always add trailing slash so URL treats it as a directory.
    // do AFTER it has been normalized to POSIX paths with `href` (don’t use Node internals here! This may run in the browser)
    config.outDir = new URL(config.outDir.href.replace(TRAILING_SLASH_RE, '/'));
  }

  // config.plugins
  if (typeof config.plugins === 'undefined') {
    config.plugins = [];
  }
  if (!Array.isArray(config.plugins)) {
    logger.error({
      label: 'config.plugins',
      message: `Expected array of plugins, received ${JSON.stringify(config.plugins)}`,
    });
  }
  config.plugins.push(coreLintPlugin());
  for (let n = 0; n < config.plugins.length; n++) {
    const plugin = config.plugins[n];
    if (typeof plugin !== 'object') {
      logger.error({ label: `plugin[${n}]`, message: `Expected output plugin, received ${JSON.stringify(plugin)}` });
    } else if (!plugin.name) {
      logger.error({ label: `plugin[${n}]`, message: `Missing "name"` });
    }
  }
  // order plugins with "enforce"
  config.plugins.sort((a, b) => {
    if (a.enforce === 'pre' && b.enforce !== 'pre') {
      return -1;
    } else if (a.enforce === 'post' && b.enforce !== 'post') {
      return 1;
    }
    return 0;
  });

  // config.lint
  if (config.lint !== undefined) {
    if (config.lint === null || typeof config.lint !== 'object' || Array.isArray(config.lint)) {
      logger.error({ label: 'config.lint', message: 'Must be an object' });
      return config;
    }
    if (!config.lint.build) {
      config.lint.build = { enabled: true };
    }
    if (config.lint.build.enabled !== undefined) {
      if (typeof config.lint.build.enabled !== 'boolean') {
        logger.error({
          label: 'config.lint.build.enabled',
          message: `Expected boolean, received ${JSON.stringify(config.lint.build)}`,
        });
      }
    } else {
      config.lint.build.enabled = true;
    }
    if (config.lint.rules === undefined) {
      config.lint.rules = {};
    } else {
      if (config.lint.rules === null || typeof config.lint.rules !== 'object' || Array.isArray(config.lint.rules)) {
        logger.error({
          label: 'config.lint.rules',
          message: `Expected object, received ${JSON.stringify(config.lint.rules)}`,
        });
      }
      for (const id in config.lint.rules) {
        if (!Object.hasOwn(config.lint.rules, id)) {
          continue;
        }
        if (typeof id !== 'string') {
          logger.error({ label: 'config.lint.rules', message: `Expects string keys, received ${JSON.stringify(id)}` });
        }
        const value = config.lint.rules[id];
        let severity = 'off';
        let options;
        if (typeof value === 'number' || typeof value === 'string') {
          severity = value;
        } else if (Array.isArray(value)) {
          severity = value[0];
          options = value[1];
        } else if (value !== undefined) {
          logger.error({
            label: `config.lint.rule:${id}`,
            message: `Invalid eyntax. Expected \`string | number | Array\`, received ${JSON.stringify(value)}}`,
          });
        }
        config.lint.rules[id] = { id, severity, options };
        if (typeof severity === 'number') {
          if (severity !== 0 && severity !== 1 && severity !== 2) {
            logger.error({
              label: `config.lint.rule:${id}`,
              message: `Invalid number ${severity}. Specify 0 (off), 1 (warn), or 2 (error).`,
            });
            return config;
          }
          config.lint.rules[id].severity = ['off', 'warn', 'error'][severity];
        } else if (typeof severity === 'string') {
          if (severity !== 'off' && severity !== 'warn' && severity !== 'error') {
            logger.error({
              label: `config.lint.rule:${id}`,
              message: `Invalid string ${JSON.stringify(severity)}. Specify "off", "warn", or "error".`,
            });
          }
        } else if (value !== null) {
          logger.error({
            label: `config.lint.rule:${id}`,
            message: `Expected string or number, received ${JSON.stringify(value)}`,
          });
        }
      }
    }
  } else {
    config.lint = {
      build: { enabled: true },
      rules: {},
    };
  }

  // call plugin.config()
  for (const plugin of config.plugins) {
    plugin.config?.({ ...config });
  }

  logger.debug({
    group: 'parser',
    task: 'config',
    message: 'Finish config validation',
    timing: performance.now() - configStart,
  });

  return config;
}

/**
 * @param {object} a
 * @param {object} b
 * @return {object}
 */
export function mergeConfigs(a, b) {
  return merge(a, b);
}
