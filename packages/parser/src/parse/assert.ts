import type * as momoa from '@humanwhocodes/momoa';

import type Logger from '../logger.js';
import type { LogEntry } from '../logger.js';

export function assert(value: unknown, logger: Logger, entry: LogEntry): asserts value {
  if (!value) {
    logger.error(entry);
  }
}

export function assertStringNode(
  value: momoa.AnyNode | undefined,
  logger: Logger,
  entry: LogEntry,
): asserts value is momoa.StringNode {
  assert(value?.type === 'String', logger, entry);
}

export function assertObjectNode(
  value: momoa.AnyNode | undefined,
  logger: Logger,
  entry: LogEntry,
): asserts value is momoa.ObjectNode {
  assert(value?.type === 'Object', logger, entry);
}
