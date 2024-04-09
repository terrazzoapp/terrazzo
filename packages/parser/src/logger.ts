import { codeFrameColumns } from '@babel/code-frame';
import color from 'picocolors';
import wcmatch from 'wildcard-match';

export const LOG_ORDER = ['error', 'warn', 'info', 'debug'] as const;

const DEBUG_GROUP_COLOR: Record<LogGroup, typeof color.green> = { core: color.green, plugin: color.magenta };

const MESSAGE_COLOR: Record<'error' | 'warn', typeof color.green> = { error: color.red, warn: color.yellow };

export type LogSeverity = 'error' | 'warn' | 'info' | 'debug';

export type LogLevel = LogSeverity | 'silent';

export type LogGroup = 'core' | 'plugin';

export interface LogEntry {
  /** Error message to be logged */
  message: string;
  /** (optional) Prefix message with label */
  label?: string;
  /** (optional) Show code below message */
  codeFrame?: { code: string; line: number; column: number };
}

export interface DebugEntry {
  /** `core` | `plugin` */
  group: 'core' | 'plugin';
  /** Current subtask or submodule */
  task: string;
  /** Error message to be logged */
  message: string;
  /** (optional) Show code below message */
  codeFrame?: { code: string; line: number; column: number };
  /** (optional) Display performance timing */
  timing?: number;
}

const timeFormatter = new Intl.DateTimeFormat('en-gb', { timeStyle: 'medium' });

export function formatMessage(entry: LogEntry, severity: LogSeverity) {
  let message = entry.message;
  if (entry.label) {
    message = `${color.bold(`${entry.label}:`)} ${message}`;
  }
  if (severity in MESSAGE_COLOR) {
    message = MESSAGE_COLOR[severity as keyof typeof MESSAGE_COLOR](message);
  }
  if (entry.codeFrame) {
    message = `${message}\n\n${codeFrameColumns(entry.codeFrame.code, {
      start: { line: entry.codeFrame.line, column: entry.codeFrame.column },
    })}`;
  }
  return message;
}

export class Logger {
  level: LogLevel = 'info';
  debugScope = '*';

  constructor(options?: { level?: LogLevel; debugScope: string }) {
    if (options?.level) {
      this.level = options.level;
    }
    if (options?.debugScope) {
      this.debugScope = options.debugScope;
    }
  }

  setLevel(level: LogLevel) {
    this.level = level;
  }

  /** Log an error message (always; can’t be silenced) */
  error(entry: LogEntry) {
    throw new Error(formatMessage(entry, 'error'));
  }

  /** Log an info message (if logging level permits) */
  info(entry: LogEntry) {
    if (this.level === 'silent' || LOG_ORDER.indexOf(this.level) < LOG_ORDER.indexOf('info')) {
      return;
    }
    console.log(formatMessage(entry, 'info'));
  }

  /** Log a warning message (if logging level permits) */
  warn(entry: LogEntry) {
    if (this.level === 'silent' || LOG_ORDER.indexOf(this.level) < LOG_ORDER.indexOf('warn')) {
      return;
    }
    console.warn(formatMessage(entry, 'warn'));
  }

  /** Log a diagnostics message (if logging level permits) */
  debug(entry: DebugEntry) {
    if (this.level === 'silent' || LOG_ORDER.indexOf(this.level) < LOG_ORDER.indexOf('debug')) {
      return;
    }

    let message = formatMessage(entry, 'debug');

    const debugPrefix = `${entry.group}:${entry.task}`;
    if (!wcmatch(this.debugScope)(debugPrefix)) {
      return;
    }
    message = `${DEBUG_GROUP_COLOR[entry.group || 'core'](debugPrefix)} ${color.dim(
      timeFormatter.format(new Date()),
    )} ${message}`;
    if (typeof entry.timing === 'number') {
      let timing: string | number = Math.round(entry.timing);
      if (timing < 1_000) {
        timing = `${timing}ms`;
      } else if (timing < 60_000) {
        timing = `${Math.round(timing * 100) / 100_000}s`;
      }
      message = `${message} ${color.dim(`[${timing}]`)}`;
    }

    console.debug(message);
  }
}
