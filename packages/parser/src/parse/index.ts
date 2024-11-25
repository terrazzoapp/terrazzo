import { type DocumentNode, type ObjectNode, evaluate, parse as parseJSON, print } from '@humanwhocodes/momoa';
import { type Token, type TokenNormalized, isTokenMatch, pluralize, splitID } from '@terrazzo/token-tools';
import type ytm from 'yaml-to-momoa';
import lintRunner from '../lint/index.js';
import Logger from '../logger.js';
import type { ConfigInit } from '../types.js';
import { applyAliases } from './alias.js';
import { getObjMembers, injectObjMembers, maybeJSONString, traverse } from './json.js';
import normalize from './normalize.js';
import type { ParseInput } from './types.js';
import validate from './validate.js';

export * from './validate.js';

export interface ParseOptions {
  logger?: Logger;
  config: ConfigInit;
  /**
   * Skip lint step
   * @default false
   */
  skipLint?: boolean;
  /**
   * Continue on error? (Useful for `tz check`)
   * @default false
   */
  continueOnError?: boolean;
  /** Provide yamlToMomoa module to parse YAML (by default, this isn’t shipped to cut down on package weight) */
  yamlToMomoa?: typeof ytm;
}

export interface ParseResult {
  tokens: Record<string, TokenNormalized>;
  sources: Record<string, ParseInput>;
}

/** Parse */
export default async function parse(
  input: ParseInput[],
  {
    logger = new Logger(),
    skipLint = false,
    config = {} as ConfigInit,
    continueOnError = false,
    yamlToMomoa,
  }: ParseOptions = {} as ParseOptions,
): Promise<ParseResult> {
  let tokens: Record<string, TokenNormalized> = {};
  // note: only keeps track of sources with locations on disk; in-memory sources are discarded
  // (it’s only for reporting line numbers, which doesn’t mean as much for dynamic sources)
  const sources: Record<string, ParseInput> = {};

  if (!Array.isArray(input)) {
    logger.error({ group: 'parser', label: 'init', message: 'Input must be an array of input objects.' });
  }
  for (let i = 0; i < input.length; i++) {
    if (!input[i] || typeof input[i] !== 'object') {
      logger.error({ group: 'parser', label: 'init', message: `Input (${i}) must be an object.` });
    }
    if (!input[i]!.src || (typeof input[i]!.src !== 'string' && typeof input[i]!.src !== 'object')) {
      logger.error({
        group: 'parser',
        label: 'init',
        message: `Input (${i}) missing "src" with a JSON/YAML string, or JSON object.`,
      });
    }
    if (input[i]!.filename && !(input[i]!.filename instanceof URL)) {
      logger.error({
        group: 'parser',
        label: 'init',
        message: `Input (${i}) "filename" must be a URL (remote or file URL).`,
      });
    }

    const result = await parseSingle(input[i]!.src, {
      filename: input[i]!.filename!,
      logger,
      config,
      skipLint,
      continueOnError,
      yamlToMomoa,
    });

    tokens = Object.assign(tokens, result.tokens);
    if (input[i]!.filename) {
      sources[input[i]!.filename!.protocol === 'file:' ? input[i]!.filename!.href : input[i]!.filename!.href] = {
        filename: input[i]!.filename,
        src: result.src,
      };
    }
  }

  const totalStart = performance.now();

  // 5. Resolve aliases and populate groups
  for (const [id, token] of Object.entries(tokens)) {
    if (!Object.hasOwn(tokens, id)) {
      continue;
    }
    applyAliases(token, {
      tokens,
      filename: sources[token.source.loc!]?.filename!,
      src: sources[token.source.loc!]?.src as string,
      node: token.source.node,
      logger,
    });
    token.mode['.']!.$value = token.$value;
    if (token.aliasOf) {
      token.mode['.']!.aliasOf = token.aliasOf;
    }
    if (token.partialAliasOf) {
      token.mode['.']!.partialAliasOf = token.partialAliasOf;
    }
    const { group: parentGroup } = splitID(id);
    if (parentGroup) {
      for (const siblingID of Object.keys(tokens)) {
        const { group: siblingGroup } = splitID(siblingID);
        if (siblingGroup?.startsWith(parentGroup)) {
          token.group.tokens.push(siblingID);
        }
      }
    }
  }

  // 6. resolve mode aliases
  const modesStart = performance.now();
  logger.debug({
    group: 'parser',
    label: 'modes',
    message: 'Start mode resolution',
  });
  for (const [id, token] of Object.entries(tokens)) {
    if (!Object.hasOwn(tokens, id)) {
      continue;
    }
    for (const [mode, modeValue] of Object.entries(token.mode)) {
      if (mode === '.') {
        continue; // skip shadow of root value
      }
      applyAliases(modeValue, {
        tokens,
        node: modeValue.source.node,
        logger,
        src: sources[token.source.loc!]?.src as string,
      });
    }
  }
  logger.debug({
    group: 'parser',
    label: 'modes',
    message: 'Finish token modes',
    timing: performance.now() - modesStart,
  });

  logger.debug({
    group: 'parser',
    label: 'core',
    message: 'Finish all parser tasks',
    timing: performance.now() - totalStart,
  });

  if (continueOnError) {
    const { errorCount } = logger.stats();
    if (errorCount > 0) {
      logger.error({
        message: `Parser encountered ${errorCount} ${pluralize(errorCount, 'error', 'errors')}. Exiting.`,
      });
    }
  }

  return {
    tokens,
    sources,
  };
}

/** Parse a single input */
async function parseSingle(
  input: string | Record<string, any>,
  {
    filename,
    logger,
    config,
    skipLint,
    continueOnError = false,
    yamlToMomoa, // optional dependency, declared here so the parser itself doesn’t have to load a heavy dep in-browser
  }: {
    filename: URL;
    logger: Logger;
    config: ConfigInit;
    skipLint: boolean;
    continueOnError?: boolean;
    yamlToMomoa?: typeof ytm;
  },
) {
  // 1. Build AST
  let src: any;
  if (typeof input === 'string') {
    src = input;
  }
  const startParsing = performance.now();
  logger.debug({ group: 'parser', label: 'parse', message: 'Start tokens parsing' });
  let document = {} as DocumentNode;
  if (typeof input === 'string' && !maybeJSONString(input)) {
    if (yamlToMomoa) {
      try {
        document = yamlToMomoa(input); // if string, but not JSON, attempt YAML
      } catch (err) {
        logger.error({ message: String(err), filename, src: input, continueOnError });
      }
    } else {
      logger.error({
        group: 'parser',
        message: `Install \`yaml-to-momoa\` package to parse YAML, and pass in as option, e.g.:

    import { parse } from '@terrazzo/parser';
    import yamlToMomoa from 'yaml-to-momoa';

    parse(yamlString, { yamlToMomoa });`,
        continueOnError: false, // fail here; no point in continuing
      });
    }
  } else {
    document = parseJSON(
      typeof input === 'string' ? input : JSON.stringify(input, undefined, 2), // everything else: assert it’s JSON-serializable
      {
        mode: 'jsonc',
        ranges: true,
        tokens: true,
      },
    );
  }
  if (!src) {
    src = print(document, { indent: 2 });
  }
  logger.debug({
    group: 'parser',
    label: 'parse',
    message: 'Finish tokens parsing',
    timing: performance.now() - startParsing,
  });

  const tokens: Record<string, TokenNormalized> = {};

  // 2. Walk AST once to validate tokens
  const startValidation = performance.now();
  logger.debug({ group: 'parser', label: 'validate', message: 'Start tokens validation' });
  const $typeInheritance: Record<string, Token['$type']> = {};
  traverse(document, {
    enter(node, parent, path) {
      if (node.type === 'Member' && node.value.type === 'Object' && node.value.members) {
        const members = getObjMembers(node.value);

        // keep track of $types
        if (members.$type && members.$type.type === 'String' && !members.$value) {
          // @ts-ignore
          $typeInheritance[path.join('.') || '.'] = node.value.members.find((m) => m.name.value === '$type');
        }

        const id = path.join('.');

        if (members.$value) {
          const extensions = members.$extensions ? getObjMembers(members.$extensions as ObjectNode) : undefined;
          const sourceNode = structuredClone(node);

          // get parent type by taking the closest-scoped $type (length === closer)
          let parent$type: Token['$type'] | undefined;
          let longestPath = '';
          for (const [k, v] of Object.entries($typeInheritance)) {
            if (k === '.' || id.startsWith(k)) {
              if (k.length > longestPath.length) {
                parent$type = v;
                longestPath = k;
              }
            }
          }
          if (parent$type && !members.$type) {
            sourceNode.value = injectObjMembers(
              // @ts-ignore
              sourceNode.value,
              [parent$type],
            );
          }

          validate(sourceNode, { filename, src, logger });

          // All tokens must be valid, so we want to validate it up till this
          // point. However, if we are ignoring this token (or respecting
          // $deprecated, we can omit it from the output.
          const $deprecated = members.$deprecated && (evaluate(members.$deprecated) as string | boolean | undefined);
          if (
            (config.ignore.deprecated && $deprecated) ||
            (config.ignore.tokens && isTokenMatch(id, config.ignore.tokens))
          ) {
            return;
          }

          const group: TokenNormalized['group'] = { id: splitID(id).group!, tokens: [] };
          if (parent$type) {
            group.$type =
              // @ts-ignore
              parent$type.value.value;
          }
          // note: this will also include sibling tokens, so be selective about only accessing group-specific properties
          const groupMembers = getObjMembers(
            // @ts-ignore
            parent,
          );
          if (groupMembers.$description) {
            group.$description = evaluate(groupMembers.$description) as string;
          }
          if (groupMembers.$extensions) {
            group.$extensions = evaluate(groupMembers.$extensions) as Record<string, unknown>;
          }
          const token: TokenNormalized = {
            // @ts-ignore
            $type: members.$type?.value ?? parent$type?.value.value,
            // @ts-ignore
            $value: evaluate(members.$value),
            id,
            // @ts-ignore
            mode: {},
            // @ts-ignore
            originalValue: evaluate(node.value),
            group,
            source: {
              loc: filename ? filename.href : undefined,
              // @ts-ignore
              node: sourceNode.value,
            },
          };
          // @ts-ignore
          if (members.$description?.value) {
            // @ts-ignore
            token.$description = members.$description.value;
          }

          // handle modes
          // note that circular refs are avoided here, such as not duplicating `modes`
          const modeValues = extensions?.mode
            ? getObjMembers(
                // @ts-ignore
                extensions.mode,
              )
            : {};
          for (const mode of ['.', ...Object.keys(modeValues)]) {
            token.mode[mode] = {
              id: token.id,
              // @ts-ignore
              $type: token.$type,
              // @ts-ignore
              $value: mode === '.' ? token.$value : evaluate(modeValues[mode]),
              source: {
                loc: filename ? filename.href : undefined,
                // @ts-ignore
                node: mode === '.' ? structuredClone(token.source.node) : modeValues[mode],
              },
            };
            if (token.$description) {
              token.mode[mode]!.$description = token.$description;
            }
          }

          tokens[id] = token;
        } else if (!id.includes('.$value') && members.value) {
          logger.warn({ message: `Group ${id} has "value". Did you mean "$value"?`, filename, node, src });
        }
      }

      // edge case: if $type appears at root of tokens.json, collect it
      if (node.type === 'Document' && node.body.type === 'Object' && node.body.members) {
        const members = getObjMembers(node.body);
        if (members.$type && members.$type.type === 'String' && !members.$value) {
          // @ts-ignore
          $typeInheritance['.'] = node.body.members.find((m) => m.name.value === '$type');
        }
      }
    },
  });
  logger.debug({
    group: 'parser',
    label: 'validate',
    message: 'Finish tokens validation',
    timing: performance.now() - startValidation,
  });

  // 3. normalize values
  const normalizeStart = performance.now();
  logger.debug({
    group: 'parser',
    label: 'normalize',
    message: 'Start token normalization',
  });
  for (const [id, token] of Object.entries(tokens)) {
    try {
      tokens[id]!.$value = normalize(token);
    } catch (err) {
      let { node } = token.source;
      const members = getObjMembers(node);
      if (members.$value) {
        node = members.$value as ObjectNode;
      }
      logger.error({ message: (err as Error).message, filename, src, node, continueOnError });
    }
    for (const [mode, modeValue] of Object.entries(token.mode)) {
      if (mode === '.') {
        continue;
      }
      try {
        tokens[id]!.mode[mode]!.$value = normalize(modeValue);
      } catch (err) {
        let { node } = token.source;
        const members = getObjMembers(node);
        if (members.$value) {
          node = members.$value as ObjectNode;
        }
        logger.error({
          message: (err as Error).message,
          filename,
          src,
          node: modeValue.source.node,
          continueOnError,
        });
      }
    }
  }

  // 4. Execute lint runner with loaded plugins
  if (!skipLint && config?.plugins?.length) {
    const lintStart = performance.now();
    logger.debug({
      group: 'parser',
      label: 'validate',
      message: 'Start token linting',
    });
    await lintRunner({ tokens, src, config, logger });
    logger.debug({
      group: 'parser',
      label: 'validate',
      message: 'Finish token linting',
      timing: performance.now() - lintStart,
    });
  }

  logger.debug({
    group: 'parser',
    label: 'normalize',
    message: 'Finish token normalization',
    timing: performance.now() - normalizeStart,
  });

  return { tokens, document, src };
}
