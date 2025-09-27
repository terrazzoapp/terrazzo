import { pluralize, type TokenNormalizedSet } from '@terrazzo/token-tools';
import { merge } from 'merge-anything';
import type { LogEntry, default as Logger } from '../logger.js';
import type { ConfigInit, InputSource } from '../types.js';

export { RECOMMENDED_CONFIG } from './plugin-core/index.js';

export interface LintRunnerOptions {
  tokens: TokenNormalizedSet;
  filename?: URL;
  config: ConfigInit;
  sources: InputSource[];
  logger: Logger;
}

export default async function lintRunner({
  tokens,
  filename,
  config = {} as ConfigInit,
  sources,
  logger,
}: LintRunnerOptions): Promise<void> {
  const { plugins = [], lint } = config;
  const sourceByFilename: Record<string, InputSource> = {};
  for (const source of sources) {
    sourceByFilename[source.filename!.href] = source;
  }
  const unusedLintRules = Object.keys(lint?.rules ?? {});

  const errors: LogEntry[] = [];
  const warnings: LogEntry[] = [];
  for (const plugin of plugins) {
    if (typeof plugin.lint === 'function') {
      const s = performance.now();

      const linter = plugin.lint();

      await Promise.all(
        Object.entries(linter).map(async ([id, rule]) => {
          if (!(id in lint.rules) || lint.rules[id] === null) {
            return;
          }
          const [severity, options] = lint.rules[id]!;
          if (severity === 'off') {
            return;
          }

          // note: this usually isn’t a Promise, but it _might_ be!
          await rule.create({
            id,
            report(descriptor) {
              let message = '';
              if (!descriptor.message && !descriptor.messageId) {
                logger.error({
                  group: 'lint',
                  label: `${plugin.name} › lint › ${id}`,
                  message: 'Unable to report error: missing message or messageId',
                });
              }

              // handle message or messageId
              if (descriptor.message) {
                message = descriptor.message;
              } else {
                if (!(descriptor.messageId! in (rule.meta?.messages ?? {}))) {
                  logger.error({
                    group: 'lint',
                    label: `${plugin.name} › lint › ${id}`,
                    message: `messageId "${descriptor.messageId}" does not exist`,
                  });
                }
                message = rule.meta?.messages?.[descriptor.messageId as keyof typeof rule.meta.messages] ?? '';
              }

              // replace with descriptor.data (if any)
              if (descriptor.data && typeof descriptor.data === 'object') {
                for (const [k, v] of Object.entries(descriptor.data)) {
                  // lazy formatting
                  const formatted = ['string', 'number', 'boolean'].includes(typeof v) ? String(v) : JSON.stringify(v);
                  message = message.replace(/{{[^}]+}}/g, (inner) => {
                    const key = inner.substring(2, inner.length - 2).trim();
                    return key === k ? formatted : inner;
                  });
                }
              }

              (severity === 'error' ? errors : warnings).push({
                group: 'lint',
                label: id,
                message,
                filename,
                node: descriptor.node,
                src: sourceByFilename[descriptor.filename!]?.src,
              });
            },
            tokens,
            filename,
            sources,
            options: merge(
              rule.meta?.defaultOptions ?? [],
              rule.defaultOptions ?? [], // Note: is this the correct order to merge in?
              options,
            ),
          });
          // tick off used rule
          const unusedLintRuleI = unusedLintRules.indexOf(id);
          if (unusedLintRuleI !== -1) {
            unusedLintRules.splice(unusedLintRuleI, 1);
          }
        }),
      );

      logger.debug({
        group: 'lint',
        label: plugin.name,
        message: 'Finished',
        timing: performance.now() - s,
      });
    }
  }

  const errCount = errors.length ? `${errors.length} ${pluralize(errors.length, 'error', 'errors')}` : '';
  const warnCount = warnings.length ? `${warnings.length} ${pluralize(warnings.length, 'warning', 'warnings')}` : '';
  if (errors.length > 0) {
    logger.error(...errors, {
      group: 'lint',
      label: 'lint',
      message: [errCount, warnCount].filter(Boolean).join(', '),
    });
  }
  if (warnings.length > 0) {
    logger.warn(...warnings, { group: 'lint', label: 'lint', message: warnCount });
  }

  // warn user if they have unused lint rules (they might have meant to configure something!)
  for (const unusedRule of unusedLintRules) {
    logger.warn({ group: 'lint', label: 'lint', message: `Unknown lint rule "${unusedRule}"` });
  }
}
