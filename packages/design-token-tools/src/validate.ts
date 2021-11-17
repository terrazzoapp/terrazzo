import * as colors from 'kleur/colors';

const VALID_TOP_LEVEL = new Set(['name', 'version', 'metadata', 'tokens']);

export interface TokenManifest {
  /** Manifest name */
  name?: string;
  /** Version. Only useful for the design system */
  version?: number;
  /** Tokens. Required */
  tokens: {
    [tokensOrGroup: string]: Group | Token | File | URL;
  };
}

/** An arbitrary grouping of tokens. Groups can be nested infinitely to form namespaces. */
export interface Group<T = string> {
  type: 'group';
  /** (optional) User-friendly name of the group */
  name?: string;
  /** (optional) Longer descripton of this group */
  description?: string;
  /** (optional) Enforce that all child tokens have values for all modes */
  modes?: string[];
  tokens: {
    [tokensOrGroup: string]: Group<T> | Token<T> | File | URL;
  };
}

/** A design token. */
export interface Token<T = string> {
  type: 'token';
  /** (optional) User-friendly name of this token */
  name?: string;
  /** (optional) Longer description of this token */
  description?: string;
  value: TokenValue<T>;
}

export interface File {
  type: 'file';
  /** (optional) User-friendly name of this token */
  name?: string;
  /** (optional) Longer description of this token */
  description?: string;
  value: {
    default: string;
    [mode: string]: string;
  };
}

export interface URL {
  type: 'file';
  /** (optional) User-friendly name of this token */
  name?: string;
  /** (optional) Longer description of this token */
  description?: string;
  value: {
    default: string;
    [mode: string]: string;
  };
}

export interface TokenValue<T = string> {
  /** Required */
  default: T;
  /** Additional modes */
  [mode: string]: T;
}

/** Validate tokens.yaml file against Design Tokens 0.x schema */
export default class Validator {
  public manifest: TokenManifest;
  private errors: string[] = [];
  private warnings: string[] = [];

  constructor(manifest: TokenManifest) {
    this.manifest = manifest;
  }

  /** Run validator */
  public async validate(): Promise<{ errors: string[] | undefined; warnings: string[] | undefined }> {
    if (!this.manifest.tokens) {
      this.errors.push(`top level "tokens" property required`);
    }

    for (const k of Object.keys(this.manifest)) {
      if (!VALID_TOP_LEVEL.has(k)) {
        this.errors.push(`${colors.bold('root')}: unknown key "${k}" (arbitrary information must be placed under "metadata")`);
      }
    }

    for (const [k, v] of Object.entries(this.manifest.tokens)) {
      if (k.includes('.')) this.errors.push(`invalid name "${k}". Names cannot contain the "." character.`);
      switch (v.type) {
        case 'group':
          this.validateGroup(v, k);
          break;
        case 'token':
          this.validateToken(v, k);
          break;
        case 'file':
          this.validateFile(v, k);
          break;
        case 'url':
          this.validateURL(v, k);
          break;
      }
    }

    return {
      errors: this.errors.length ? this.errors.map((msg) => `${colors.red('✘  error  ')}  ${msg}`) : undefined,
      warnings: this.warnings.length ? this.warnings.map((msg) => `${colors.yellow('!  warning')}  ${msg}`) : undefined,
    };
  }

  private validateGroup(group: Group, id: string, chain: string[] = [], modes?: string[]): void {
    chain.push(id);
    const name = chain.join('.');

    // mode
    if (group.modes) {
      if (Array.isArray(group.modes) && group.modes.every((val) => typeof val === 'string')) {
        modes = group.modes;
      } else {
        this.errors.push(this.print(name, 'property "modes" must be an array of strings', 'group'));
      }
    }

    // tokens
    if (group.tokens) {
      if (typeof group.tokens === 'object' && !Array.isArray(group.tokens)) {
        const entries = Object.entries(group.tokens);
        if (entries.length) {
          for (const [k, v] of entries) {
            if (k.includes('.')) this.errors.push(this.print(name, `names cannot contain the "." character.`));
            switch (v.type) {
              case 'group':
                this.validateGroup(v, k, chain, modes);
                break;
              case 'token':
                this.validateToken(v, chain.concat(k).join('.'), modes);
                break;
              case 'file':
                this.validateFile(v, chain.concat(k).join('.'), modes);
                break;
              case 'url':
                this.validateURL(v, chain.concat(k).join('.'), modes);
                break;
              default:
                this.errors.push(this.print(`${name}.${k}`, `invalid type: "${(v as any).type}", expected "token" or "group".`));
                break;
            }
          }
        } else {
          this.warnings.push(this.print(name, 'group has no tokens', 'group'));
        }
      } else {
        this.errors.push(this.print(name, 'property "tokens" must be an object', 'group'));
      }
    } else {
      this.warnings.push(this.print(name, 'group has no tokens', 'group'));
    }
  }

  private validateToken(token: Token, id: string, modes?: string[]): void {
    if (token.value) {
      if (typeof token.value === 'object' && !Array.isArray(token.value) && token.value.default !== undefined && token.value.default !== null) {
        // validate modes
        if (modes && modes.length) {
          for (const mode of modes) {
            if (token.value[mode] === undefined || token.value[mode] === null) this.errors.push(this.print(id, `missing ${mode} mode`));
          }
        }
      } else {
        this.errors.push(this.print(id, 'missing default value'));
      }
    } else {
      this.errors.push(this.print(id, 'missing value'));
    }
  }

  private validateFile(file: File, id: string, modes?: string[]): void {
    if (file.value) {
    } else {
      this.errors.push(this.print(id, 'missing value', 'file'));
    }
  }

  private print(name: string, message: string, type: 'group' | 'token' | 'file' | 'url' = 'token'): string {
    const label = type === 'group' ? colors.magenta(`[group] ${name}`) : colors.cyan(`[token] ${name}`);
    return `${colors.bold(label)}: ${message}`;
  }
}
