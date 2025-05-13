import fs from 'node:fs/promises';
import path from 'node:path';

import type { BuildHookOptions } from '@terrazzo/parser';
import { FORMAT_ID } from '@terrazzo/plugin-css';
import { isTokenMatch } from '@terrazzo/token-tools';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import type { SassPluginOptions } from './lib.js';

const INDENT_NUM_SPACES = 2;

function getIndent(indentationLevel: number): string {
  return indentationLevel > 0 ? ' '.repeat(indentationLevel * INDENT_NUM_SPACES) : '';
}

export interface BuildParams {
  getTransforms: BuildHookOptions['getTransforms'];
  options?: SassPluginOptions;
}

type SassMapKey = string | number;
type SassMapValue = string | SassToken;
type SassMapValues = { [key: SassMapKey]: SassMapValue } | Iterable<[SassMapKey, SassMapValue]>;

abstract class SassToken {
  constructor(public readonly indentationLevel: number = 0) {}

  abstract format(): string;

  public toString(): string {
    return `${getIndent(this.indentationLevel)}${this.format()}`;
  }

  public createMap(values?: SassMapValues): SassMap {
    return new SassMap(this.indentationLevel + 1, values);
  }

  public createVariableDefinition(name: string, value: SassToken): VariableDefinitionSassToken {
    return new VariableDefinitionSassToken(this.indentationLevel + 1, name, value);
  }
}

abstract class ValueSassToken extends SassToken {
  public toString(): string {
    return this.format();
  }
}

class VariableDefinitionSassToken extends SassToken {
  constructor(
    indentationLevel: number,
    public readonly name: string,
    public readonly value: SassToken,
  ) {
    super(indentationLevel);
  }

  public format(): string {
    return `${this.name}: ${this.value};`;
  }
}

class StringSassToken extends SassToken {
  constructor(
    public readonly value: string,
    indentationLevel = 0,
  ) {
    super(indentationLevel);
  }

  public format(): string {
    return this.value;
  }
}

class CssVarReferenceSassToken extends StringSassToken {
  public format(): string {
    return `${makeCSSVar(this.value, { wrapVar: true })}`;
  }
}

class SassMap extends ValueSassToken {
  private readonly MAP_OPEN = '(';
  private readonly MAP_CLOSE = ')';
  private readonly MAP_VALUE_SEPARATOR = ',\n';

  private readonly SEPARATOR = '\n';

  private readonly values: Map<SassMapKey, SassMapValue>;

  constructor(indentationLevel: number, values?: SassMapValues) {
    super(indentationLevel);
    this.values = new Map<SassMapKey, SassMapValue>(
      values ? (Array.isArray(values) ? values : Object.entries(values)) : undefined,
    );
  }

  public set(key: SassMapKey, value: SassMapValue) {
    this.values.set(key, value);
  }

  public setMap(key: SassMapKey, values: SassMapValues) {
    const nestedMap = this.createMap(values);
    this.set(key, nestedMap);
    return nestedMap;
  }

  public format(): string {
    return [
      this.MAP_OPEN,
      Array.from(
        this.values
          .entries()
          .map(([key, value]) => new StringSassToken(`"${key}": ${value}`, this.indentationLevel + 1)),
      ).join(this.MAP_VALUE_SEPARATOR),
      new StringSassToken(this.MAP_CLOSE, this.indentationLevel),
    ].join(this.SEPARATOR);
  }
}

class UseSassToken extends StringSassToken {
  constructor(value: string, as_?: string) {
    const valueQuoted = `"${value}"`;
    const atUseUrl = as_ ? `${valueQuoted} as ${as_}` : valueQuoted;
    super(`@use ${atUseUrl};`);
  }
}

class BlankLineSassToken extends StringSassToken {
  constructor() {
    super('');
  }
}

class RootSassToken extends SassToken {
  private readonly SEPARATOR = '\n';

  private sassTokens: SassToken[];

  constructor() {
    super(-1);
    this.sassTokens = [];
  }

  public append(sassToken: SassToken) {
    this.sassTokens.push(sassToken);
  }

  public appendString(value: string) {
    this.append(new StringSassToken(value));
  }

  public appendVariableDefinition(name: string, sassToken: SassToken) {
    this.append(this.createVariableDefinition(name, sassToken));
  }

  public appendBlankLine() {
    this.append(new BlankLineSassToken());
  }

  public appendUse(value: string, as_?: string) {
    this.append(new UseSassToken(value, as_));
  }

  public format(): string {
    return this.sassTokens.map((sassToken) => sassToken).join(this.SEPARATOR);
  }
}

class SassBuilder {
  private FONT_SHORTHAND_PROPERTIES = [
    'font-family',
    'font-size',
    'font-style',
    'font-variant',
    'font-weight',
    'line-height',
  ];

  public async build({ getTransforms, options }: BuildParams): Promise<string> {
    const root = new RootSassToken();

    root.appendString((await this.readSassAssetFileHeader()).toString());

    root.appendUse('sass:list');
    root.appendUse('sass:map');

    root.appendBlankLine();

    const tokenValuesMap = root.createMap();

    for (const token of getTransforms({ format: FORMAT_ID, id: '*', mode: '.' })) {
      if (isTokenMatch(token.token.id, options?.exclude ?? [])) {
        continue;
      }

      const tokenId = token.token.id;
      const tokenName = token.localID ?? tokenId;

      if (token.token.$type === 'typography') {
        // typography tokens handled later
        tokenValuesMap.set(tokenId, '"__tz-error-typography"');
      } else {
        tokenValuesMap.set(tokenId, new CssVarReferenceSassToken(tokenName));
      }
    }

    root.appendVariableDefinition('$__token-values', tokenValuesMap);

    root.appendBlankLine();

    const tokenTypographyMixinsMap = root.createMap();

    for (const token of getTransforms({ format: 'css', id: '*', mode: '.', $type: 'typography' })) {
      if (typeof token.value === 'string') {
        continue;
      }

      const tokenId = token.token.id;
      const tokenName = token.localID ?? tokenId;
      const tokenValue = token.value;

      const values = { ...token.value };

      let useFontshorthand = false;

      if ('font-size' in tokenValue && 'font-family' in tokenValue) {
        useFontshorthand = true;
        for (const property of this.FONT_SHORTHAND_PROPERTIES) {
          delete values[property];
        }
      }

      const fontMap = tokenTypographyMixinsMap.setMap(
        tokenId,
        Object.keys(values).map(
          (propertyName) =>
            [propertyName, new CssVarReferenceSassToken(`${tokenName}-${propertyName}`)] as [SassMapKey, SassMapValue],
        ),
      );

      if (useFontshorthand) {
        fontMap.set('font', new CssVarReferenceSassToken(`${tokenName}`));
      }
    }

    root.appendVariableDefinition('$__token-typography-mixins', tokenTypographyMixinsMap);

    root.appendBlankLine();

    root.appendString((await this.readSassAssetTokenLibrary()).toString());

    return root.toString();
  }

  private async readSassAsset(fileName: string): Promise<Buffer<ArrayBufferLike>> {
    // Let the error bubble up for now
    return fs.readFile(path.join(import.meta.dirname, '..', 'assets', 'sass', fileName));
  }

  private async readSassAssetFileHeader(): Promise<Buffer<ArrayBufferLike>> {
    return this.readSassAsset('file_header.scss');
  }

  private async readSassAssetTokenLibrary(): Promise<Buffer<ArrayBufferLike>> {
    return this.readSassAsset('token_lib.scss');
  }
}

export default async function build({ getTransforms, options }: BuildParams): Promise<string> {
  return await new SassBuilder().build({ getTransforms, options });
}
