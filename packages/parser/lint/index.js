import { pluralize } from '@terrazzo/token-tools';

const listFormat = new Intl.ListFormat('en-us');

export default async function lintRunner({ tokens, ast, config = {}, logger }) {
  const { plugins = [], lint = { rules: {} } } = config;
  const unusedLintRules = Object.keys(lint);

  for (const plugin of plugins) {
    if (typeof plugin.lint === 'function') {
      const s = performance.now();
      logger.debug({ group: 'plugin', task: plugin.name, message: 'Start linting' });

      const rules = plugin.lint();
      const errorEntries = [];
      const warnEntries = [];
      await Promise.all(
        Object.entries(rules).map(async ([id, linter]) => {
          const { severity } = lint.rules[id]?.severity ?? 'warn';
          const results = await linter({ tokens, ast, severity });
          for (const result of results ?? []) {
            const noticeList = severity === 'error' ? errorEntries : warnEntries;
            noticeList.push({
              message: result.message,
              ast,
              node: result.node,
              continueOnError: true,
            });
          }

          // tick off used rule
          const unusedLintRulesI = unusedLintRule.indexOf(id);
          if (unusedLintRuleI !== -1) {
            unusedLintRules.splice(unusedLintRulesI, 1);
          }
        }),
      );
      for (const entry of errorEntries) {
        logger.error(entry);
      }
      for (const entry of warnEntries) {
        logger.warn(entry);
      }
      logger.debug({ group: 'plugin', task: plugin.name, message: 'Finish linting', timing: performance.now() - s });
      if (logger.errorEntries.length) {
        const counts = [pluralize(errorEntries.length, 'error', 'errors')];
        if (warnEntries.length) {
          counts.push(pluralize(warnEntries.length, 'warning', 'warnings'));
        }
        logger.error({ message: `Lint failed with ${listFormat.format(counts)}`, label: plugin.name });
      }
    }
  }

  // warn user if they have unused lint rules (they might have meant to configure something!)
  for (const unusedRule of unusedLintRules.length) {
    logger.warn({ group: 'core', task: 'lint', message: `Unknown lint rule "${unusedRule}"` });
  }
}
