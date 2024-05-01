import { codeFrameColumns } from '@babel/code-frame';
import color from 'picocolors';
import wcmatch from 'wildcard-match';

export const LOG_ORDER = ['error', 'warn', 'info', 'debug'];

const DEBUG_GROUP_COLOR = { core: color.green, plugin: color.magenta };

const MESSAGE_COLOR = { error: color.red, warn: color.yellow };

const timeFormatter = new Intl.DateTimeFormat('en-gb', { timeStyle: 'medium' });

/**
 * @param {Entry} entry
 * @param {Severity} severity
 * @return {string}
 */
export function formatMessage(entry, severity) {
  let message = entry.message;
  if (entry.label) {
    message = `${color.bold(`${entry.label}:`)} ${message}`;
  }
  if (severity in MESSAGE_COLOR) {
    message = MESSAGE_COLOR[severity](message);
  }
  if (entry.source) {
    message = `${message}\n\n${codeFrameColumns(entry.source, { start: entry.node?.loc?.start })}`;
  }
  return message;
}

export default class Logger {
  level = 'info';
  debugScope = '*';

  constructor(options) {
    if (options?.level) {
      this.level = options.level;
    }
    if (options?.debugScope) {
      this.debugScope = options.debugScope;
    }
  }

  setLevel(level) {
    this.level = level;
  }

  /** Log an error message (always; can’t be silenced) */
  error(entry) {
    const message = formatMessage(entry, 'error');
    if (entry.continueOnError) {
      console.error(message);
      return;
    }
    if (entry.node) {
      throw new TokensJSONError(message, entry.node);
    } else {
      throw new Error(message);
    }
  }

  /** Log an info message (if logging level permits) */
  info(entry) {
    if (this.level === 'silent' || LOG_ORDER.indexOf(this.level) < LOG_ORDER.indexOf('info')) {
      return;
    }
    // biome-ignore lint/suspicious/noConsoleLog: this is its job
    console.log(formatMessage(entry, 'info'));
  }

  /** Log a warning message (if logging level permits) */
  warn(entry) {
    if (this.level === 'silent' || LOG_ORDER.indexOf(this.level) < LOG_ORDER.indexOf('warn')) {
      return;
    }
    console.warn(formatMessage(entry, 'warn'));
  }

  /** Log a diagnostics message (if logging level permits) */
  debug(entry) {
    if (this.level === 'silent' || LOG_ORDER.indexOf(this.level) < LOG_ORDER.indexOf('debug')) {
      return;
    }

    let message = formatMessage(entry, 'debug');

    const debugPrefix = `${entry.group}:${entry.task}`;
    if (this.debugScope !== '*' && !wcmatch(this.debugScope)(debugPrefix)) {
      return;
    }
    message = `${(DEBUG_GROUP_COLOR[entry.group] || color.white)(debugPrefix)} ${color.dim(
      timeFormatter.format(new Date()),
    )} ${message}`;
    if (typeof entry.timing === 'number') {
      let timing = Math.round(entry.timing);
      if (timing < 1_000) {
        timing = `${timing}ms`;
      } else if (timing < 60_000) {
        timing = `${Math.round(timing * 100) / 100_000}s`;
      }
      message = `${message} ${color.dim(`[${timing}]`)}`;
    }

    // biome-ignore lint/suspicious/noConsoleLog: this is its job
    console.log(message);
  }
}

export class TokensJSONError extends Error {
  /** Erring JSON node */
  node;

  constructor(message, node) {
    super(message);
    this.name = 'TokensJSONError';
    this.node = node;
  }
}
