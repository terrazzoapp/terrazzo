import co, { type Group, type LintRule, type ParseResult, type ResolvedConfig } from '@cobalt-ui/core';
import fs from 'node:fs';
import { URL } from 'node:url';

export default async function build(rawSchema: Group, config: ResolvedConfig): Promise<ParseResult> {
  const { errors = [], warnings = [], result } = co.parse(rawSchema, config);
  if (errors.length) {
    return { errors, warnings, result };
  }

  // 1. Config
  config.plugins.map((plugin) => {
    try {
      if (plugin.config) {
        plugin.config(config);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[${plugin.name}] ${err}`);
      throw err;
    }
  });

  // 2. Lint
  const ruleToPlugin = new Map<string, string>();
  const registeredRules = config.plugins.map((plugin) => {
    const finalRules: LintRule[] = [];
    if (typeof plugin.registerRules === 'function') {
      const rules = plugin.registerRules();
      if (!Array.isArray(rules)) {
        // eslint-disable-next-line no-console
        console.error(`[${plugin.name}] expected \`registerRules()\` to return array, received ${rules}`);
        return finalRules;
      }
      for (const rule of rules) {
        if (ruleToPlugin.has(rule.id)) {
          // eslint-disable-next-line no-console
          console.error(`[${plugin.name}] attempted to register rule "${rule.id}" already registered by plugin ${ruleToPlugin.get(rule.id)}`);
          continue;
        }
        ruleToPlugin.set(rule.id, plugin.name);
        finalRules.push(rule);
      }
    }
    return finalRules;
  });

  await Promise.all(
    config.plugins.map(async (plugin, i) => {
      if (typeof plugin.lint !== 'function') {
        if (registeredRules[i]!.length) {
          errors.push(`[${plugin.name}] registered lint rules but is missing the lint() callback.`);
        }
        return;
      }

      try {
        // fill in registered defaults and user overrides
        const rules = registeredRules[i]!.map<LintRule>((rule) => {
          const { severity = rule.severity, options = rule.options } = config.lint.rules![rule.id] ?? {};
          return { id: rule.id, severity, options };
        });
        const notifications = await plugin.lint!({ tokens: result.tokens, rules, rawSchema });
        if (notifications?.length) {
          for (const notification of notifications) {
            if (ruleToPlugin.get(notification.id) !== plugin.name) {
              // ignore notifications not registered to plugin
              continue;
            }
            const { severity } = rules.find((rule) => rule.id === notification.id) ?? { severity: 'off' };
            // TODO: when node is added, show code line
            if (severity === 'error') {
              errors.push(`[${plugin.name}] Error ${notification.id}: ${notification.message}`);
            } else if (severity === 'warn') {
              warnings.push(`[${plugin.name}] Warning ${notification.id}: ${notification.message}`);
            }
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[${plugin.name}] ${err}`);
        throw err;
      }
    }),
  );

  if (errors.length) {
    return { errors, warnings, result };
  }

  // 3. Build
  await Promise.all(
    config.plugins.map(async (plugin) => {
      if (typeof plugin.build !== 'function') {
        return;
      }

      try {
        // build()
        const results = await plugin.build({ tokens: result.tokens, metadata: result.metadata, rawSchema });
        if (!results) {
          return;
        }
        if (!Array.isArray(results) || !results.every((r) => r.filename && r.contents)) {
          throw new Error(`[${plugin.name}] invalid build results`);
        }
        for (const { filename, contents } of results) {
          const filePath = new URL(filename.replace(/^\//, ''), config.outDir);
          fs.mkdirSync(new URL('./', filePath), { recursive: true });
          fs.writeFileSync(filePath, contents);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[${plugin.name}] ${err}`);
        throw err;
      }
    }),
  );

  return {
    errors: errors.length ? errors : undefined,
    warnings: warnings.length ? warnings : undefined,
    result,
  };
}
