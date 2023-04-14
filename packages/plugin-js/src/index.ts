import type {BuildResult, Mode, ParsedToken, Plugin, Token} from '@cobalt-ui/core';
import {cloneDeep, indent, objKey} from '@cobalt-ui/utils';

const JS_EXT_RE = /\.(mjs|js)$/i;
const JSON_EXT_RE = /\.json$/i;
const SINGLE_QUOTE_RE = /'/g;

export type TransformFn = (token: ParsedToken, mode?: string) => (typeof token)['$value'];

export interface Options {
  /** output JS? (default: true) */
  js?: boolean | string;
  /** output JSON? (default: false) */
  json?: boolean | string;
  /** modify values */
  transform?: TransformFn;
}

interface JSResult {
  tokens: {[id: string]: ParsedToken['$value']};
  meta: {[id: string]: Token};
  modes: {[id: string]: Mode<ParsedToken['$value']>};
}

const tokenTypes: Record<ParsedToken['$type'], string> = {
  color: 'ColorToken',
  fontFamily: 'FontFamilyToken',
  fontWeight: 'FontWeightToken',
  dimension: 'DimensionToken',
  duration: 'DurationToken',
  cubicBezier: 'CubicBezierToken',
  number: 'NumberToken',
  link: 'LinkToken',
  strokeStyle: 'StrokeStyleToken',
  border: 'BorderToken',
  transition: 'TransitionToken',
  shadow: 'ShadowToken',
  gradient: 'GradientToken',
  typography: 'TypographyToken',
};

/** serialize JS ref into string */
export function serializeJS(value: unknown, options?: {comments?: Record<string, string>; indentLv?: number}): string {
  const comments = options?.comments || {};
  const indentLv = options?.indentLv || 0;
  if (typeof value === 'string') return `'${value.replace(SINGLE_QUOTE_RE, "\\'")}'`;
  if (typeof value === 'number') return `${value}`;
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (Array.isArray(value)) return `[${value.map((item) => serializeJS(item, {indentLv: indentLv + 1})).join(', ')}]`;
  if (typeof value === 'function') throw new Error(`Cannot serialize function ${value}`);
  if (typeof value === 'object')
    return `{
${Object.entries(value)
  .map(([k, v]) => `${comments[k] ? `${indent(`/** ${comments[k]} */`, indentLv + 1)}\n` : ''}${indent(objKey(k), indentLv + 1)}: ${serializeJS(v, {indentLv: indentLv + 1})}`)
  .join(',\n')},
${indent(`}${indentLv === 0 ? ';' : ''}`, indentLv)}`;
  throw new Error(`Could not serialize ${value}`);
}

function defaultTransform(token: ParsedToken, mode?: string): (typeof token)['$value'] {
  if (!mode || !token.$extensions?.mode || !(mode in token.$extensions.mode) || !token.$extensions.mode[mode]) return token.$value;
  const modeVal = token.$extensions.mode[mode];
  if (typeof modeVal === 'string' || Array.isArray(modeVal) || typeof modeVal === 'number') return modeVal;
  return {...(token.$value as typeof modeVal), ...modeVal};
}

export default function pluginJS(options?: Options): Plugin {
  if (options && options.js === false && options.json === false) throw new Error(`[plugin-js] Must output either JS or JSON. Received "js: false" and "json: false"`);

  const tsImports = new Set<string>();

  // set default options
  let jsFilename: string | undefined = './index.js';
  if (options?.js === false || (options?.js === undefined && options?.json !== undefined)) jsFilename = undefined;
  else if (typeof options?.js === 'string' && options.js.length) jsFilename = options.js;
  let jsonFilename: string | undefined;
  if (options?.json === true) jsonFilename = './tokens.json';
  else if (typeof options?.json === 'string' && options.json.length) jsonFilename = options.json;

  // validate options
  if (jsFilename && !JS_EXT_RE.test(jsFilename)) throw new Error(`JS filename must end in .js or .mjs`);
  if (jsonFilename && !JSON_EXT_RE.test(jsonFilename)) throw new Error(`JSON filename must end in .json`);

  return {
    name: '@cobalt-ui/plugin-js',
    async build({tokens, metadata}): Promise<BuildResult[]> {
      let files: BuildResult[] = [];
      const buildTS = !!jsFilename; // should .d.ts be built?

      // 1. Build values
      const js: JSResult = {
        tokens: {},
        meta: {},
        modes: {},
      };
      const ts: Record<'tokens' | 'meta' | 'modes', string[]> = {tokens: [], meta: [], modes: []};
      const transform = (typeof options?.transform === 'function' && options.transform) || defaultTransform;
      for (const token of tokens) {
        js.tokens[token.id] = await transform(token);
        if (buildTS) {
          const t = tokenTypes[token.$type];
          ts.tokens.push(indent(`${objKey(token.id)}: ${t}['$value'];`, 1));
          tsImports.add(t);
        }
        js.meta[token.id] = {
          _original: cloneDeep(token._original),
          ...((token._group && {_group: token._group}) || {}),
          ...cloneDeep(token as any),
        };
        if (buildTS) {
          const t = `Parsed${tokenTypes[token.$type]}`;
          ts.meta.push(indent(`${objKey(token.id)}: ${t}${token.$extensions?.mode ? ` & { $extensions: { mode: typeof modes['${token.id}'] } }` : ''};`, 1));
          tsImports.add(t);
        }
        if (token.$extensions?.mode) {
          js.modes[token.id] = {};
          if (buildTS) ts.modes.push(indent(`${objKey(token.id)}: {`, 1));
          for (const modeName of Object.keys(token.$extensions.mode)) {
            js.modes[token.id][modeName] = await transform(token, modeName);
            if (buildTS) ts.modes.push(indent(`${objKey(modeName)}: ${tokenTypes[token.$type]}['$value'];`, 2));
          }
          if (buildTS) ts.modes.push(indent('};', 1));
        }
      }

      // 2. Write to file
      const comment = `/**
 * ${metadata.name || 'Design Tokens'}
 * Autogenerated from tokens.json.
 * DO NOT EDIT!
 */`;

      // JSON
      if (jsonFilename) {
        files.push({
          filename: jsonFilename,
          contents: `${JSON.stringify(js, undefined, 2)}\n`, // EOF newline
        });
      }

      // JS + TS
      if (jsFilename) {
        const sortedTypeImports = [...tsImports];
        sortedTypeImports.sort();
        const jsDoc: Record<string, string> = {};
        for (const token of tokens) {
          if (token.$description) jsDoc[token.id] = token.$description;
        }
        files.push(
          {
            filename: jsFilename,
            contents: [
              comment,
              '',
              `export const tokens = ${serializeJS(js.tokens, {comments: jsDoc})}`,
              '',
              `export const meta = ${serializeJS(js.meta)}`,
              '',
              `export const modes = ${Object.keys(js.modes).length ? serializeJS(js.modes) : `{};`}`,
              '',
              `/** Get individual token */
export function token(tokenID, modeName) {
  if (modeName && modes[tokenID] && modeName in modes[tokenID]) return modes[tokenID][modeName];
  return tokens[tokenID];
}`,
              '', // EOF newline
            ].join('\n'),
          },
          {
            filename: jsFilename.replace(JS_EXT_RE, '.d.ts'),
            contents: [
              comment,
              '',
              'import {',
              ...sortedTypeImports.map((m) => indent(`${m},`, 1)),
              `} from '@cobalt-ui/core';`,
              '',
              'export declare const tokens: {',
              ...ts.tokens,
              '};',
              '',
              'export declare const meta: {',
              ...ts.meta,
              '};',
              '',
              `export declare const modes: ${ts.modes.length ? `{\n${ts.modes.join('\n')}\n}` : 'Record<string, never>'};`,
              '',
              `export declare function token<K extends keyof typeof tokens>(tokenID: K, modeName?: never): typeof tokens[K];`,
              `export declare function token<K extends keyof typeof modes, M extends keyof typeof modes[K]>(tokenID: K, modeName: M): typeof modes[K][M];`,
              '', // EOF newline
            ].join('\n'),
          },
        );
      }

      return files;
    },
  };
}
