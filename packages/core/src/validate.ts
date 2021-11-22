import type { FileOrURL, Group, Token, TokenManifest, TokenType } from './parse';
import fs from 'fs';
import * as colors from 'kleur/colors';

const VALID_TOP_LEVEL = new Set<keyof TokenManifest>(['name', 'version', 'metadata', 'tokens']);

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
      if (!VALID_TOP_LEVEL.has(k as keyof TokenManifest)) {
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
    this.validateValue({ id, value: token.value, modes, type: 'token' });
  }

  private validateFile(file: FileOrURL, id: string, modes?: string[]): void {
    if (this.validateValue({ id, value: file.value, modes, type: 'file' })) {
      for (const [k, v] of Object.entries(file.value)) {
        if (k == 'default' && typeof v !== 'string') this.errors.push(this.print(id, `default value must be string, received ${typeof v}`, 'file'));
        else if (typeof v !== 'string') this.errors.push(this.print(id, `${k} mode must be string, received ${typeof v}`, 'file'));
        let found = false;
        for (const f of [v, new URL(v, `file://${process.cwd()}/`)]) {
          if (fs.existsSync(f)) {
            found = true;
            break;
          }
        }
        if (!found) this.errors.push(this.print(id, `could not locate file ${v} (if this is a url, use "type": "url" instead)`, 'file'));
      }
    }
  }

  private validateURL(url: FileOrURL, id: string, modes?: string[]): void {
    if (this.validateValue({ id, value: url.value, modes, type: 'url' })) {
      for (const [k, v] of Object.entries(url.value)) {
        if (k === 'default' && typeof v !== 'string') this.errors.push(this.print(id, `default value must be string, received ${typeof v}`, 'url'));
        else if (typeof v !== 'string') this.errors.push(this.print(id, `${k} mode must be string, received ${typeof v}`, 'url'));
        try {
          new URL(v);
        } catch {
          this.errors.push(this.print(id, `value "${k}" has invalid URL: ${v} (if this is a file, use "type": "file" instead)`, 'url'));
        }
      }
    }
  }

  private validateValue({ id, value, type, modes }: { id: string; value: { default: any } & Record<string, any>; type: TokenType; modes?: string[] }): boolean {
    let hasValue = false; // return "true" if other functions can evaluate the value
    if (value) {
      if (typeof value === 'object' && !Array.isArray(value) && value.default !== undefined && value.default !== null) {
        hasValue = true;
        if (modes && modes.length) {
          for (const mode of modes) {
            if (value[mode] === undefined || value[mode] === null) this.errors.push(this.print(id, `missing ${mode} mode`, type));
          }
        }
      } else {
        this.errors.push(this.print(id, 'missing default value', type));
      }
    } else {
      this.errors.push(this.print(id, 'missing value', type));
    }
    return hasValue;
  }

  private print(name: string, message: string, type?: TokenType): string {
    let label: string | undefined;
    if (type) {
      let color: typeof colors.bold;
      switch (type) {
        case 'group':
          color = colors.magenta;
          break;
        case 'token':
          color = colors.cyan;
          break;
        case 'file':
        case 'url':
          color = colors.green;
          break;
      }
      if (color as any) label = color(`[${type}]`);
    }
    return `${label ? colors.bold(label) : ''} ${name}: ${message}`;
  }
}
