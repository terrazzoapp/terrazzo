import { CORE_LINT_RULES, CORE_LINT_RULES_DEFAULT_SEVERITY, lintCore, type Group, type LintRule, type ParsedToken, type ResolvedConfig } from '@cobalt-ui/core';
import { indentLine } from '@cobalt-ui/utils';

export interface LintOptions {
  config: ResolvedConfig;
  tokens: ParsedToken[];
  rawSchema: Group;
  /** Warn if no lint plugins (disabled for `co build`, enabled for `co lint`) */
  warnIfNoPlugins?: boolean;
}

export interface LintResult {
  errors?: string[];
  warnings?: string[];
}

export default async function lint({ config, tokens, rawSchema, warnIfNoPlugins = false }: LintOptions): Promise<LintResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  const ruleToPlugin = new Map<string, string>(Object.values(CORE_LINT_RULES).map((rule) => [rule, '@cobalt-ui/core']));
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

  if (warnIfNoPlugins && registeredRules.length === 0) {
    warnings.push(`No lint plugins in config. Nothing to lint.`);
  }

  // handle core lint rules first
  const coreLintRules: LintRule[] = [];
  const coreSeverity: Record<string, LintRule['severity']> = {};
  for (const id in CORE_LINT_RULES) {
    const severity = config.lint.rules?.[id]?.severity ?? CORE_LINT_RULES_DEFAULT_SEVERITY[id as keyof typeof CORE_LINT_RULES_DEFAULT_SEVERITY]!;
    coreSeverity[id] = severity;
    const rule: LintRule = { id, severity, options: config.lint.rules?.[id]?.options };
    coreLintRules.push(rule);
  }
  const coreNotices = lintCore({ tokens, rules: coreLintRules, rawSchema });
  if (coreNotices?.length) {
    for (const notice of coreNotices) {
      const severity = coreSeverity[notice.id];
      if (severity === 'error') {
        errors.push(
          `${notice.id}: ERROR
${indentLine(notice.message, 2)}`,
        );
      } else if (severity === 'warn') {
        warnings.push(`${notice.id}: WARNING
${indentLine(notice.message, 2)}`);
      }
    }
  }

  // then handle plugin lint rules
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
        const notifications = await plugin.lint!({ tokens, rules, rawSchema });
        if (notifications?.length) {
          for (const notification of notifications) {
            if (ruleToPlugin.get(notification.id) !== plugin.name) {
              // ignore notifications not registered to plugin
              continue;
            }
            const { severity } = rules.find((rule) => rule.id === notification.id) ?? { severity: 'off' };
            // TODO: when node is added, show code line
            if (severity === 'error') {
              errors.push(
                `${notification.id}: ERROR
${indentLine(notification.message, 2)}`,
              );
            } else if (severity === 'warn') {
              warnings.push(`${notification.id}: WARNING
${indentLine(notification.message, 2)}`);
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

  const result: LintResult = {};
  if (errors.length) {
    result.errors = errors;
  }
  if (warnings.length) {
    result.warnings = warnings;
  }

  return result;
}
