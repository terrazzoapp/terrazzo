import { type TokenNormalized, pluralize } from '@terrazzo/token-tools';
import { merge } from 'merge-anything';
import type { LogEntry, default as Logger } from '../logger.js';
import type { ConfigInit } from '../types.js';

const listFormat = new Intl.ListFormat('en-us');

export interface LintRunnerOptions {
  tokens: Record<string, TokenNormalized>;
  filename?: URL;
  config: ConfigInit;
  src: string;
  logger: Logger;
}

export default async function lintRunner({
  tokens,
  filename,
  config = {} as ConfigInit,
  src,
  logger,
}: LintRunnerOptions): Promise<void> {
  const { plugins = [], lint } = config;
  const unusedLintRules = Object.keys(lint?.rules ?? {});

  for (const plugin of plugins) {
    if (typeof plugin.lint === 'function') {
      const s = performance.now();

      const linter = plugin.lint();
      const errors: LogEntry[] = [];
      const warnings: LogEntry[] = [];

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
                src: descriptor.source?.src,
              });
            },
            tokens,
            filename,
            src,
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

      for (const error of errors) {
        logger.error({ ...error, continueOnError: true }); // print out all errors before exiting here
      }
      for (const warning of warnings) {
        logger.warn(warning);
      }

      logger.debug({ group: 'lint', label: plugin.name, message: 'Finished', timing: performance.now() - s });

      if (errors.length) {
        const counts = [pluralize(errors.length, 'error', 'errors')];
        if (warnings.length) {
          counts.push(pluralize(warnings.length, 'warning', 'warnings'));
        }
        logger.error({
          group: 'lint',
          message: `Lint failed with ${listFormat.format(counts)}`,
          label: plugin.name,
          continueOnError: false,
        });
      }
    }
  }

  // warn user if they have unused lint rules (they might have meant to configure something!)
  for (const unusedRule of unusedLintRules) {
    logger.warn({ group: 'lint', label: 'lint', message: `Unknown lint rule "${unusedRule}"` });
  }
}
