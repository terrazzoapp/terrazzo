import { merge } from 'merge-anything';
import coreLintPlugin from './lint/plugin-core/index.js';
import Logger from './logger.js';
import type { Config, ConfigInit, ConfigOptions, LintRuleSeverity } from './types.js';

const TRAILING_SLASH_RE = /\/*$/;

/**
 * Validate and normalize a config
 */
export default function defineConfig(
  rawConfig: Config,
  { logger = new Logger(), cwd }: ConfigOptions = {} as ConfigOptions,
): ConfigInit {
  const configStart = performance.now();

  if (!cwd) {
    logger.error({ label: 'core', message: 'defineConfig() missing `cwd` for JS API' });
  }

  logger.debug({ group: 'parser', label: 'config', message: 'Start config validation' });

  const config = merge({}, rawConfig) as unknown as ConfigInit;

  // 1. normalize and init
  normalizeTokens({ rawConfig, config, logger, cwd });
  normalizeOutDir({ config, cwd, logger });
  normalizePlugins({ config, logger });
  normalizeLint({ config, logger });
  normalizeIgnore({ config, logger });

  // 2. Start build by calling config()
  for (const plugin of config.plugins) {
    plugin.config?.({ ...config });
  }

  // 3. finish
  logger.debug({
    group: 'parser',
    label: 'config',
    message: 'Finish config validation',
    timing: performance.now() - configStart,
  });
  return config;
}

/** Normalize config.tokens */
function normalizeTokens({
  rawConfig,
  config,
  logger,
  cwd,
}: { rawConfig: Config; config: ConfigInit; logger: Logger; cwd: URL }) {
  if (rawConfig.tokens === undefined) {
    config.tokens = [
      // @ts-ignore we’ll normalize in next step
      './tokens.json',
    ];
  } else if (typeof rawConfig.tokens === 'string') {
    config.tokens = [
      // @ts-ignore we’ll normalize in next step
      rawConfig.tokens,
    ];
  } else if (Array.isArray(rawConfig.tokens)) {
    config.tokens = [];
    for (const file of rawConfig.tokens) {
      if (typeof file === 'string' || (file as URL) instanceof URL) {
        config.tokens.push(
          // @ts-ignore we’ll normalize in next step
          file,
        );
      } else {
        logger.error({
          label: '[config] tokens',
          message: `Expected array of strings, encountered ${JSON.stringify(file)}`,
        });
      }
    }
  } else {
    logger.error({
      label: '[config] tokens',
      message: `Expected string or array of strings, received ${typeof rawConfig.tokens}`,
    });
  }
  for (let i = 0; i < config.tokens!.length; i++) {
    const filepath = config.tokens[i]!;
    if (filepath instanceof URL) {
      continue; // skip if already resolved
    }
    try {
      config.tokens[i] = new URL(filepath, cwd);
    } catch (err) {
      logger.error({ label: '[config] tokens', message: `Invalid URL ${filepath}` });
    }
  }
}

/** Normalize config.outDir */
function normalizeOutDir({ config, cwd, logger }: { config: ConfigInit; logger: Logger; cwd: URL }) {
  if (config.outDir instanceof URL) {
    // noop
  } else if (typeof config.outDir === 'undefined') {
    config.outDir = new URL('./tokens/', cwd);
  } else if (typeof config.outDir !== 'string') {
    logger.error({ label: '[config] outDir', message: `Expected string, received ${JSON.stringify(config.outDir)}` });
  } else {
    config.outDir = new URL(config.outDir, cwd);
    // always add trailing slash so URL treats it as a directory.
    // do AFTER it has been normalized to POSIX paths with `href` (don’t use Node internals here! This may run in the browser)
    config.outDir = new URL(config.outDir.href.replace(TRAILING_SLASH_RE, '/'));
  }
}

/** Normalize config.plugins */
function normalizePlugins({ config, logger }: { config: ConfigInit; logger: Logger }) {
  if (typeof config.plugins === 'undefined') {
    config.plugins = [];
  }
  if (!Array.isArray(config.plugins)) {
    logger.error({
      label: '[config] plugins',
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
}

function normalizeLint({ config, logger }: { config: ConfigInit; logger: Logger }) {
  if (config.lint !== undefined) {
    if (config.lint === null || typeof config.lint !== 'object' || Array.isArray(config.lint)) {
      logger.error({ label: '[config] lint', message: 'Must be an object' });
    }
    if (!config.lint.build) {
      config.lint.build = { enabled: true };
    }
    if (config.lint.build.enabled !== undefined) {
      if (typeof config.lint.build.enabled !== 'boolean') {
        logger.error({
          label: '[config] lint › build › enabled',
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
          label: '[config] lint › rules',
          message: `Expected object, received ${JSON.stringify(config.lint.rules)}`,
        });
        return;
      }

      const allRules = new Map<string, string>();
      for (const plugin of config.plugins) {
        if (typeof plugin.lint !== 'function') {
          continue;
        }
        const pluginRules = plugin.lint();
        if (!pluginRules || Array.isArray(pluginRules) || typeof pluginRules !== 'object') {
          logger.error({
            label: `[config] plugin › ${plugin.name}`,
            message: `Expected object for lint() received ${JSON.stringify(pluginRules)}`,
          });
          continue;
        }
        for (const rule of Object.keys(pluginRules)) {
          // Note: sometimes plugins will be loaded multiple times, in which case it’s expected
          // they’re register rules again for lint(). Only throw an error if plugin A and plugin B’s
          // rules conflict.

          if (allRules.get(rule) && allRules.get(rule) !== plugin.name) {
            logger.error({
              label: `[config] plugin › ${plugin.name}`,
              message: `Duplicate rule ${rule} already registered by plugin ${allRules.get(rule)}`,
            });
          }
          allRules.set(rule, plugin.name);
        }
      }

      for (const id of Object.keys(config.lint.rules)) {
        if (!allRules.has(id)) {
          logger.error({
            label: `[config] lint › rule › ${id}`,
            message: 'Unknown rule. Is the plugin installed?',
          });
        }

        const value = config.lint.rules[id];
        let severity: LintRuleSeverity = 'off';
        let options: any;
        if (typeof value === 'number' || typeof value === 'string') {
          severity = value;
        } else if (Array.isArray(value)) {
          severity = value[0] as LintRuleSeverity;
          options = value[1];
        } else if (value !== undefined) {
          logger.error({
            label: `[config] lint › rule › ${id}`,
            message: `Invalid eyntax. Expected \`string | number | Array\`, received ${JSON.stringify(value)}}`,
          });
        }
        config.lint.rules[id] = [severity, options];
        if (typeof severity === 'number') {
          if (severity !== 0 && severity !== 1 && severity !== 2) {
            logger.error({
              label: `[config] lint › rule › ${id}`,
              message: `Invalid number ${severity}. Specify 0 (off), 1 (warn), or 2 (error).`,
            });
          }
          config.lint.rules[id]![0] = (['off', 'warn', 'error'] as const)[severity]!;
        } else if (typeof severity === 'string') {
          if (severity !== 'off' && severity !== 'warn' && severity !== 'error') {
            logger.error({
              label: `[config] lint › rule › ${id}`,
              message: `Invalid string ${JSON.stringify(severity)}. Specify "off", "warn", or "error".`,
            });
          }
        } else if (value !== null) {
          logger.error({
            label: `[config] lint › rule › ${id}`,
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
}

function normalizeIgnore({ config, logger }: { config: ConfigInit; logger: Logger }) {
  if (!config.ignore) {
    config.ignore = {} as typeof config.ignore;
  }
  config.ignore.tokens ??= [];
  config.ignore.deprecated ??= false;
  if (!Array.isArray(config.ignore.tokens) || config.ignore.tokens.some((x) => typeof x !== 'string')) {
    logger.error({
      label: '[config] ignore › tokens',
      message: `Expected array of strings, received ${JSON.stringify(config.ignore.tokens)}`,
    });
  }
  if (typeof config.ignore.deprecated !== 'boolean') {
    logger.error({
      label: '[config] ignore › deprecated',
      message: `Expected boolean, received ${JSON.stringify(config.ignore.deprecated)}`,
    });
  }
}

/** Merge configs */
export function mergeConfigs(a: Config, b: Config): Config {
  return merge(a, b);
}
