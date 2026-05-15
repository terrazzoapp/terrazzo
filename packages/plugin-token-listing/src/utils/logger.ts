import type { Logger } from "@terrazzo/parser";

const LOG_GROUP = 'plugin' as const;
const LOG_LABEL = 'token-listing';

export function error(logger: Logger, message: string, params?: Omit<Parameters<Logger['error']>[0], 'group' | 'label'>): void {
  logger.error({ group: LOG_GROUP, label: LOG_LABEL, message, ...params });
}

export function warn(logger: Logger, message: string, params?: Omit<Parameters<Logger['warn']>[0], 'group' | 'label'>): void {
  logger.warn({ group: LOG_GROUP, label: LOG_LABEL, message, ...params });
}
