import type {BuildResult, Mode, ParsedToken, Plugin, Token} from '@cobalt-ui/core';
import {cloneDeep, indent, objKey, set} from '@cobalt-ui/utils';

const JS_EXT_RE = /\.(mjs|js)$/i;
const JSON_EXT_RE = /\.json$/i;
const SINGLE_QUOTE_RE = /'/g;

export type TransformFn = (token: ParsedToken, mode?: string) => (typeof token)['$value'];

export interface Options {
  /** output JS? (default: true) */
  js?: boolean | string;
  /** output JSON? (default: false) */
  json?: boolean | string;
  /** output meta? (default: false) */
  meta?: boolean;
  /** modify values */
  transform?: TransformFn;
  /** nested or flat output (default: false) */
  deep?: boolean;
}

interface JSResult {
  tokens: {[id: string]: ParsedToken['$value'] | JSResult['tokens']};
  meta?: {[id: string]: Token | JSResult['meta']};
  modes: {[id: string]: Mode<ParsedToken['$value'] | JSResult['modes']>};
}

interface TSResult {
  tokens: {[id: string]: string | TSResult['tokens']};
  meta?: {[id: string]: string | TSResult['meta']};
  modes: {[id: string]: string | TSResult['modes']};
}

const tokenTypes: Record<ParsedToken['$type'], string> = {
  color: 'ParsedColorToken',
  fontFamily: 'ParsedFontFamilyToken',
  fontWeight: 'ParsedFontWeightToken',
  dimension: 'ParsedDimensionToken',
  duration: 'ParsedDurationToken',
  cubicBezier: 'ParsedCubicBezierToken',
  number: 'ParsedNumberToken',
  link: 'ParsedLinkToken',
  strokeStyle: 'ParsedStrokeStyleToken',
  border: 'ParsedBorderToken',
  transition: 'ParsedTransitionToken',
  shadow: 'ParsedShadowToken',
  gradient: 'ParsedGradientToken',
  typography: 'ParsedTypographyToken',
};

/** serialize JS ref into string */
export function serializeJS(value: unknown, options?: {comments?: Record<string, string>; commentPath?: string; indentLv?: number}): string {
  const comments = options?.comments || {};
  const commentPath = options?.commentPath ?? '';
  const indentLv = options?.indentLv || 0;
  if (typeof value === 'string') {
    return `'${value.replace(SINGLE_QUOTE_RE, "\\'")}'`;
  }
  if (typeof value === 'number' || typeof value === 'boolean' || value === undefined || value === null) {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => serializeJS(item, {indentLv})).join(', ')}]`;
  }
  if (typeof value === 'function') {
    throw new Error(`Cannot serialize function ${value}`);
  }
  if (typeof value === 'object') {
    return `{
${Object.entries(value)
  .map(([k, v]) => {
    const nextCommentPath = commentPath === '' ? k : `${commentPath}.${k}`;
    const comment = comments[nextCommentPath] ? `${indent(`/** ${comments[nextCommentPath]} */`, indentLv + 1)}\n` : '';

    return `${comment}${indent(objKey(k), indentLv + 1)}: ${serializeJS(v, {
      comments,
      commentPath: nextCommentPath,
      indentLv: indentLv + 1,
    })}`;
  })
  .join(',\n')},
${indent(`}${indentLv === 0 ? ';' : ''}`, indentLv)}`;
  }
  throw new Error(`Could not serialize ${value}`);
}

/** serialize TS ref into string */
export function serializeTS(value: unknown, options?: {indentLv?: number}): string {
  const indentLv = options?.indentLv || 0;
  if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean' || value === 'undefined' || value === null) {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => serializeTS(item, {indentLv})).join(', ')}]`;
  }
  if (typeof value === 'function') {
    throw new Error(`Cannot serialize function ${value}`);
  }
  if (typeof value === 'object') {
    return `{
${Object.entries(value)
  .map(([k, v]) => `${indent(objKey(k), indentLv + 1)}: ${serializeTS(v, {indentLv: indentLv + 1})}`)
  .join(';\n')};
${indent(`}${indentLv === 0 ? ';' : ''}`, indentLv)}`;
  }
  throw new Error(`Could not serialize ${value}`);
}

export function defaultTransformer(token: ParsedToken, mode?: string): (typeof token)['$value'] {
  if (!mode || !token.$extensions?.mode || !(mode in token.$extensions.mode) || !(mode in token.$extensions.mode)) {
    return token.$value;
  }
  const modeVal = token.$extensions.mode[mode];
  if (typeof modeVal === 'string' || Array.isArray(modeVal) || typeof modeVal === 'number') {
    return modeVal;
  }
  return {...(token.$value as typeof modeVal), ...modeVal};
}

function setToken<T extends Record<string, any>>(obj: T, id: keyof T, value: any, nest = false): T {
  if (nest) {
    return set(obj, id, value);
  }

  obj[id] = value;

  return obj;
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
      const includeMeta = options?.meta !== false; // should `meta` be included?

      // 1. Build values
      const js: JSResult = {
        tokens: {},
        meta: {},
        modes: {},
      };
      const ts: TSResult = {tokens: {}, meta: {}, modes: {}};
      for (const token of tokens) {
        let result = await options?.transform?.(token);
        if (result === undefined || result === null) {
          result = defaultTransformer(token);
        }
        setToken(js.tokens, token.id, result, options?.deep);
        if (buildTS) {
          const t = tokenTypes[token.$type];
          setToken(ts.tokens, token.id, `${t}['$value']`, options?.deep);
          tsImports.add(t);
        }
        setToken(
          js.meta!,
          token.id,
          {
            _original: cloneDeep(token._original),
            ...((token._group && {_group: token._group}) || {}),
            ...cloneDeep(token as any),
          },
          options?.deep,
        );
        if (buildTS) {
          const t = `${tokenTypes[token.$type]}`;
          const modeAccessor = options?.deep ? token.id.replace('.', "']['") : token.id;
          setToken(ts.meta!, token.id, `${t}${token.$extensions?.mode ? ` & { $extensions: { mode: typeof modes['${modeAccessor}'] } }` : ''}`, options?.deep);
          tsImports.add(t);
        }
        if (token.$extensions?.mode) {
          setToken(js.modes, token.id, {}, options?.deep);
          if (buildTS) setToken(ts.modes, token.id, {}, options?.deep);
          for (const modeName of Object.keys(token.$extensions.mode)) {
            let modeResult = await options?.transform?.(token, modeName);
            if (modeResult === undefined || modeResult === null) {
              modeResult = defaultTransformer(token, modeName);
            }
            if (options?.deep) {
              setToken(js.modes, `${token.id}.${modeName}`, modeResult, true);
            } else {
              js.modes[token.id]![modeName] = modeResult;
            }
            if (buildTS) {
              if (options?.deep) {
                setToken(ts.modes, `${token.id}.${modeName}`, `${tokenTypes[token.$type]}['$value']`, true);
              } else {
                (ts.modes[token.id] as TSResult['modes'])[modeName] = `${tokenTypes[token.$type]}['$value']`;
              }
            }
          }
        }
      }

      if (!includeMeta) {
        delete js.meta;
        delete ts.meta;
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
              ...(js.meta ? [`export const meta = ${serializeJS(js.meta)}`, ''] : []),
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
              `export declare const tokens: ${serializeTS(ts.tokens)}`,
              '',
              ...(ts.meta ? [`export declare const meta: ${serializeTS(ts.meta)}`, ''] : []),
              `export declare const modes: ${Object.keys(ts.modes).length ? serializeTS(ts.modes) : 'Record<string, never>;'}`,
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
