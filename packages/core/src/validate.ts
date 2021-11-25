import type { RawFileNode, RawGroupNode, NodeType, RawTokenNode, RawTokenSchema, RawURLNode } from './parse';

import fs from 'fs';
import * as colors from 'kleur/colors';

const VALID_TOP_LEVEL = new Set<keyof RawTokenSchema>(['name', 'version', 'metadata', 'tokens']);

export class Validator {
  private errors: string[] = [];
  private warnings: string[] = [];

  public async validate(schema: RawTokenSchema): Promise<{ errors: string[] | undefined; warnings: string[] | undefined }> {
    this.errors = [];
    this.warnings = [];

    if (!schema.tokens) {
      this.errors.push(`top level "tokens" property required`);
    }

    for (const k of Object.keys(schema)) {
      if (!VALID_TOP_LEVEL.has(k as keyof RawTokenSchema)) {
        this.errors.push(`${colors.bold('root')}: unknown key "${k}" (arbitrary information must be placed under "metadata")`);
      }
    }

    for (const [k, v] of Object.entries(schema.tokens)) {
      if (k.includes('.')) this.errors.push(`invalid name "${k}". Names cannot contain the "." character.`);
      switch (v.type) {
        case 'group':
          this.validateGroup(v, k);
          break;
        case 'token':
        case undefined:
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

  private validateGroup(group: RawGroupNode, id: string, chain: string[] = [], modes?: string[]): void {
    chain.push(id);
    const name = chain.join('.');

    // group.mode ?
    if (group.modes) {
      if (Array.isArray(group.modes) && group.modes.every((val) => typeof val === 'string')) {
        modes = group.modes;
      } else {
        this.errors.push(this.print(name, 'property "modes" must be an array of strings', 'group'));
      }
    }

    // group.tokens ?
    if (group.tokens) {
      if (typeof group.tokens === 'object' && !Array.isArray(group.tokens)) {
        const entries = Object.entries(group.tokens);
        // group.tokens not empty ?
        if (entries.length) {
          for (const [k, v] of entries) {
            // token has bad name ?
            if (k.includes('.')) this.errors.push(this.print(name, `names cannot contain the "." character.`));
            switch (v.type) {
              case 'group':
                this.validateGroup(v, k, chain, modes);
                break;
              case 'token':
              case undefined:
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
        }
        // group.tokens empty (error)
        else this.warnings.push(this.print(name, 'group has no tokens', 'group'));
      }
      // group.tokens bad format (error)
      else this.errors.push(this.print(name, 'property "tokens" must be an object', 'group'));
    }
    // empty group (error)
    else this.warnings.push(this.print(name, 'group has no tokens', 'group'));
  }

  private validateToken(token: RawTokenNode, id: string, modes?: string[]): void {
    this.validateValue({ id, value: token.value, modes, type: 'token' });
  }

  private validateFile(file: RawFileNode, id: string, modes?: string[]): void {
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

  private validateURL(url: RawURLNode, id: string, modes?: string[]): void {
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

  private validateValue({ id, value, type, modes }: { id: string; value: RawTokenNode<string>['value']; type: NodeType; modes?: string[] }): boolean {
    let hasValue = false; // return "true" if other functions can evaluate the value
    // value is truthy?
    if (value) {
      // value is array ?
      if (Array.isArray(value)) {
        // group.modes ?
        if (modes && modes.length) {
          // value array length is good (OK)
          if (value.length === 1 || value.length === modes.length + 1) {
            hasValue = true;
          }
          // value array has some modes but not others (error)
          else {
            this.errors.push(this.print(id, `value array length must be 1 (value is the same for all modes) or ${modes.length} (default followed by all modes in order), received ${value.length}`, type));
          }
        }
        // value can’t be array if no group.modes (error)
        else {
          this.errors.push(this.print(id, 'value array type can only be used if a parent group set modes', type));
        }
      }
      // value is object ?
      else if (typeof value === 'object') {
        // value.default?
        if (value.default !== undefined && value.default !== null) {
          // group.modes ?
          if (modes && modes.length) {
            // value.default exists, value.default is the same for all modes (OK)
            if (Object.keys(value).length === 1) {
              hasValue = true;
            }
            // verify all modes have values
            else {
              for (const mode of modes) {
                if (value[mode] === undefined || value[mode] === null) this.errors.push(this.print(id, `missing ${mode} mode`, type));
              }
            }
          }
          // value.default exists, no modes (OK)
          else hasValue = true;
        }
        // no value.default (error)
        else this.errors.push(this.print(id, 'missing default value', type));
      }
      // value is ??? (OK?)
      else hasValue = true;
    }
    // value is falsy
    else this.errors.push(this.print(id, 'missing value', type));

    return hasValue;
  }

  private print(name: string, message: string, type?: NodeType): string {
    let label: string | undefined;
    if (type) {
      let color: typeof colors.bold;
      switch (type) {
        case 'group':
          color = colors.magenta;
          break;
        case 'token':
        case undefined:
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
