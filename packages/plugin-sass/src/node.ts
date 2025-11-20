import { makeCSSVar } from '@terrazzo/token-tools/css';
import { getIndent } from './lib.js';

export type SassMapKey = string | number;
export type SassMapValue = string | SassToken;
export type SassMapValues = Record<SassMapKey, SassMapValue> | Iterable<[SassMapKey, SassMapValue]>;

export abstract class SassToken {
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

export abstract class ValueSassToken extends SassToken {
  public toString(): string {
    return this.format();
  }
}

export class StringSassToken extends SassToken {
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

export class CssVarReferenceSassToken extends StringSassToken {
  public format(): string {
    return `${makeCSSVar(this.value, { wrapVar: true })}`;
  }
}

export class BlankLineSassToken extends StringSassToken {
  constructor() {
    super('');
  }
}

export class RootSassToken extends SassToken {
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

export class SassMap extends ValueSassToken {
  private readonly MAP_OPEN = '(';
  private readonly MAP_CLOSE = ')';
  private readonly MAP_VALUE_SEPARATOR = ',\n';

  private readonly SEPARATOR = '\n';

  private readonly values: Map<SassMapKey, SassMapValue>;

  constructor(indentationLevel: number, values?: SassMapValues) {
    super(indentationLevel);
    this.values = new Map<SassMapKey, SassMapValue>(values ? this.sassMapValuesToIter(values) : undefined);
  }

  public set(key: SassMapKey, value: SassMapValue) {
    this.values.set(key, value);
  }

  public extend(values: SassMapValues) {
    for (const [key, value] of this.sassMapValuesToIter(values)) {
      this.set(key, value);
    }
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

  private sassMapValuesToIter(values: SassMapValues) {
    return Symbol.iterator in values && typeof values[Symbol.iterator] === 'function' ? values : Object.entries(values);
  }
}

export class UseSassToken extends StringSassToken {
  constructor(value: string, as_?: string) {
    const valueQuoted = `"${value}"`;
    const atUseUrl = as_ ? `${valueQuoted} as ${as_}` : valueQuoted;
    super(`@use ${atUseUrl};`);
  }
}

export class VariableDefinitionSassToken extends SassToken {
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
