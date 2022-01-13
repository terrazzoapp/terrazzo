export interface IndentOptions {
  /** default: space */
  character?: string;
  /** default: 2 */
  count?: number;
  /** default: false */
  includeEmptyLines?: boolean;
}

const TRAILING_SPACE_RE = /\s*$/;

/**
 * Indent
 * The main difference between this and the "indent-string" package
 * is that this saves your indent options, making it easier to configure.
 * Also, it normalizes indent, making it serve as both indent and dedent.
 */
export class Indenter {
  private char = ' ';
  private count = 2;
  private includeEmptyLines = false;

  constructor(opts?: IndentOptions) {
    if (typeof opts?.character === 'string') this.char = opts.character;
    if (typeof opts?.count === 'number') this.count = opts.count;
    if (typeof opts?.includeEmptyLines === 'boolean') this.includeEmptyLines = opts.includeEmptyLines;
  }

  indent(str: string, level: number): string {
    const { char, count, includeEmptyLines } = this;
    const prefix = new Array(count * level + 1).join(char);
    return str
      .split('\n')
      .map((ln) => {
        // handle empty line
        const isEmptyLine = !ln.trim();
        if (isEmptyLine) return includeEmptyLines ? prefix : '';

        // indent
        return `${prefix}${ln.replace(TRAILING_SPACE_RE, '')}`;
      })
      .join('\n');
  }
}
