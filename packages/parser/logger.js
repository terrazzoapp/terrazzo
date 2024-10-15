import color from 'picocolors';
import wcmatch from 'wildcard-match';
import { codeFrameColumns } from './lib/code-frame.js';

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
  if (entry.src) {
    const start = entry.node?.loc?.start;
    //  strip "file://" protocol, but not href
    const loc = entry.filename
      ? `${entry.filename?.href.replace(/^file:\/\//, '')}:${start?.line ?? 0}:${start?.column ?? 0}\n\n`
      : '';
    const codeFrame = codeFrameColumns(entry.src, { start }, { highlightCode: false });
    message = `${message}\n\n${loc}${codeFrame}`;
  }
  return message;
}

export default class Logger {
  level = 'info';
  debugScope = '*';
  errorCount = 0;
  warnCount = 0;
  infoCount = 0;
  debugCount = 0;

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
    this.errorCount++;
    const message = formatMessage(entry, 'error');
    if (entry.continueOnError) {
      console.error(message);
      return;
    }
    if (entry.node) {
      throw new TokensJSONError(message);
    } else {
      throw new Error(message);
    }
  }

  /** Log an info message (if logging level permits) */
  info(entry) {
    this.infoCount++;
    if (this.level === 'silent' || LOG_ORDER.indexOf(this.level) < LOG_ORDER.indexOf('info')) {
      return;
    }
    // biome-ignore lint/suspicious/noConsoleLog: this is its job
    console.log(formatMessage(entry, 'info'));
  }

  /** Log a warning message (if logging level permits) */
  warn(entry) {
    this.warnCount++;
    if (this.level === 'silent' || LOG_ORDER.indexOf(this.level) < LOG_ORDER.indexOf('warn')) {
      return;
    }
    console.warn(formatMessage(entry, 'warn'));
  }

  /** Log a diagnostics message (if logging level permits) */
  debug(entry) {
    this.debugCount++;
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

  /** Get stats for current logger instance */
  stats() {
    return {
      errorCount: this.errorCount,
      warnCount: this.warnCount,
      infoCount: this.infoCount,
      debugCount: this.debugCount,
    };
  }
}

export class TokensJSONError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TokensJSONError';
  }
}
