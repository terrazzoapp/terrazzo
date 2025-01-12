import { type DocumentNode, type ObjectNode, print } from '@humanwhocodes/momoa';
import { type Token, type TokenNormalized, pluralize, splitID } from '@terrazzo/token-tools';
import type ytm from 'yaml-to-momoa';
import lintRunner from '../lint/index.js';
import Logger from '../logger.js';
import type { ConfigInit, InputSource } from '../types.js';
import { applyAliases } from './alias.js';
import { getObjMembers, toMomoa, tracePointer, traverse } from './json.js';
import normalize from './normalize.js';
import validateTokenNode from './validate.js';

export * from './alias.js';
export * from './normalize.js';
export * from './json.js';
export * from './resolve.js';
export * from './validate.js';
export { normalize, validateTokenNode };

const INVALID_POINTERS = new Set(['', '#', '/', '#/']); // we can’t support these pointers which will recursively embed themselves

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
  /** (internal cache; do not use) */
  _sources?: Record<string, InputSource>;
}

export interface ParseResult {
  tokens: Record<string, TokenNormalized>;
  sources: InputSource[];
}

/** Parse */
export default async function parse(
  input: Omit<InputSource, 'document'>[],
  {
    logger = new Logger(),
    skipLint = false,
    config = {} as ConfigInit,
    continueOnError = false,
    yamlToMomoa,
    _sources = {},
  }: ParseOptions = {} as ParseOptions,
): Promise<ParseResult> {
  let tokens: Record<string, TokenNormalized> = {};

  if (!Array.isArray(input)) {
    logger.error({ group: 'parser', label: 'init', message: 'Input must be an array of input objects.' });
  }
  await Promise.all(
    input.map(async (src, i) => {
      if (!src || typeof src !== 'object') {
        logger.error({ group: 'parser', label: 'init', message: `Input (${i}) must be an object.` });
      }
      if (!src.src || (typeof src.src !== 'string' && typeof src.src !== 'object')) {
        logger.error({
          message: `Input (${i}) missing "src" with a JSON/YAML string, or JSON object.`,
          group: 'parser',
          label: 'init',
        });
      }
      if (src.filename) {
        if (!(src.filename instanceof URL)) {
          logger.error({
            message: `Input (${i}) "filename" must be a URL (remote or file URL).`,
            group: 'parser',
            label: 'init',
          });
        }

        // if already parsed/scanned, skip
        if (_sources[src.filename.href]) {
          return;
        }
      }

      const result = await parseSingle(src.src, {
        filename: src.filename!,
        logger,
        config,
        skipLint,
        continueOnError,
        yamlToMomoa,
      });

      tokens = Object.assign(tokens, result.tokens);
      if (src.filename) {
        _sources[src.filename.href] = {
          filename: src.filename,
          src: result.src,
          document: result.document,
        };
      }
    }),
  );

  const totalStart = performance.now();

  // 5. Resolve aliases and populate groups
  const aliasesStart = performance.now();
  let aliasCount = 0;
  for (const [id, token] of Object.entries(tokens)) {
    if (!Object.hasOwn(tokens, id)) {
      continue;
    }
    applyAliases(token, {
      tokens,
      filename: _sources[token.source.loc!]?.filename!,
      src: _sources[token.source.loc!]?.src as string,
      node: token.source.node,
      logger,
    });
    token.mode['.']!.$type = token.$type;
    token.mode['.']!.$value = token.$value;
    if (token.aliasOf) {
      token.mode['.']!.aliasOf = token.aliasOf;
    }
    if (token.aliasChain) {
      token.mode['.']!.aliasChain = token.aliasChain;
    }
    if (token.aliasedBy) {
      token.mode['.']!.aliasedBy = token.aliasedBy;
    }
    if (token.partialAliasOf) {
      token.mode['.']!.partialAliasOf = token.partialAliasOf;
    }
    aliasCount++;
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
  logger.debug({
    message: `Resolved ${aliasCount} aliases`,
    group: 'parser',
    label: 'alias',
    timing: performance.now() - aliasesStart,
  });

  // 7. resolve mode aliases
  const modesStart = performance.now();
  let modeAliasCount = 0;
  for (const [id, token] of Object.entries(tokens)) {
    if (!Object.hasOwn(tokens, id)) {
      continue;
    }
    for (const [mode, modeValue] of Object.entries(token.mode)) {
      if (mode === '.') {
        continue; // skip shadow of root value
      }
      modeAliasCount++;
      applyAliases(modeValue, {
        tokens,
        node: modeValue.source.node,
        logger,
        src: _sources[token.source.loc!]?.src as string,
        skipReverseAlias: true,
      });
    }
  }
  logger.debug({
    message: `Resolved ${modeAliasCount} mode aliases`,
    group: 'parser',
    label: 'alias',
    timing: performance.now() - modesStart,
  });

  logger.debug({
    message: 'Finish all parser tasks',
    group: 'parser',
    label: 'core',
    timing: performance.now() - totalStart,
  });

  if (continueOnError) {
    const { errorCount } = logger.stats();
    if (errorCount > 0) {
      logger.error({
        group: 'parser',
        message: `Parser encountered ${errorCount} ${pluralize(errorCount, 'error', 'errors')}. Exiting.`,
      });
    }
  }

  return {
    tokens,
    sources: Object.values(_sources),
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
    _sources = {},
  }: {
    filename: URL;
    logger: Logger;
    config: ConfigInit;
    skipLint: boolean;
    continueOnError?: boolean;
    yamlToMomoa?: typeof ytm;
    _sources?: Record<string, InputSource>;
  },
): Promise<{ tokens: Record<string, Token>; document: DocumentNode; src?: string }> {
  // 1. Build AST
  const startParsing = performance.now();
  const { src, document } = toMomoa(input, { filename, logger, continueOnError, yamlToMomoa });
  logger.debug({
    group: 'parser',
    label: 'json',
    message: 'Finish JSON parsing',
    timing: performance.now() - startParsing,
  });
  const tokens: Record<string, TokenNormalized> = {};

  // 2. Walk AST once to resolve $refs (if any)
  const startResolve = performance.now();
  logger.debug({ group: 'parser', label: 'resolve', message: 'Start tokens resolving' });
  const unresolvedPromises: Promise<any>[] = [];
  traverse(document, {
    enter(node) {
      // handle $refs and $defs
      if (node.type === 'Member' && node.value.type === 'Object') {
        const $refI = node.value.members.findIndex((m) => m.name.type === 'String' && m.name.value === '$ref');
        let $ref = node.value.members[$refI];
        if ($ref) {
          if ($ref.value.type !== 'String') {
            logger.error({
              group: 'parser',
              label: 'alias',
              message: `Invalid ref: ${print($ref)}. Must be a valid JSON pointer (RFC 6901).`,
              filename,
              node,
              src,
            });
            return;
          }
          const pointerValue = $ref.value.value;
          if (INVALID_POINTERS.has(pointerValue)) {
            logger.error({
              group: 'parser',
              label: 'alias',
              message: `Invalid ref: ${pointerValue}. Can’t recursively embed the same document within itself.`,
              filename,
              node: $ref,
              src,
            });
            return;
          }
          // note: by pushing these to the background, we can parallelize as many as possible at once
          unresolvedPromises.push(
            tracePointer(pointerValue, { filename, src, node: $ref, document, logger, yamlToMomoa, _sources }).then(
              (result) => {
                if (result) {
                  // if pointer has been resolved, replace the $ref node outright with the resolved one
                  // note that we’re ONLY replacing the $ref itself, NOT the parent object, so this is a
                  // safe operation
                  $ref = result.node as any;
                }
              },
            ),
          );
        }
      }
    },
  });
  if (unresolvedPromises.length) {
    await Promise.all(unresolvedPromises);
  }
  logger.debug({
    message: 'Finish tokens resolving',
    group: 'parser',
    label: 'resolve',
    timing: performance.now() - startResolve,
  });

  // 3. Walk AST a 2nd time to validate tokens (can only be done after everything has settled, otherwise we’d have to
  // restart the traversal every $ref insert, and we’d redo too much work
  let tokenCount = 0;
  const startValidate = performance.now();
  const $typeInheritance: Record<string, Token['$type']> = {};
  traverse(document, {
    enter(node, parent, subpath) {
      // if $type appears at root of tokens.json, collect it
      if (node.type === 'Document' && node.body.type === 'Object' && node.body.members) {
        const members = getObjMembers(node.body);
        if (members.$type && members.$type.type === 'String' && !members.$value) {
          // @ts-ignore
          $typeInheritance['.'] = node.body.members.find((m) => m.name.value === '$type');
        }
      }

      // handle tokens
      if (node.type === 'Member') {
        const token = validateTokenNode(node, { filename, src, config, logger, parent, subpath, $typeInheritance });
        if (token) {
          tokens[token.id] = token;
          tokenCount++;
        }
      }
    },
  });
  logger.debug({
    message: `Validated ${tokenCount} tokens`,
    group: 'parser',
    label: 'validate',
    timing: performance.now() - startValidate,
  });

  // 4. normalize values
  const normalizeStart = performance.now();
  for (const [id, token] of Object.entries(tokens)) {
    try {
      tokens[id]!.$value = normalize(token);
    } catch (err) {
      let { node } = token.source;
      const members = getObjMembers(node);
      if (members.$value) {
        node = members.$value as ObjectNode;
      }
      logger.error({
        group: 'parser',
        label: 'normalize',
        message: (err as Error).message,
        filename,
        src,
        node,
        continueOnError,
      });
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
          group: 'parser',
          label: 'normalize',
          message: (err as Error).message,
          filename,
          src,
          node: modeValue.source.node,
          continueOnError,
        });
      }
    }
  }
  logger.debug({
    message: `Normalized ${tokenCount} tokens`,
    group: 'parser',
    label: 'normalize',
    timing: performance.now() - normalizeStart,
  });

  // 5. Execute lint runner with loaded plugins
  if (!skipLint && config?.plugins?.length) {
    const lintStart = performance.now();
    await lintRunner({ tokens, src, config, logger });
    logger.debug({
      message: `Linted ${tokenCount} tokens`,
      group: 'parser',
      label: 'lint',
      timing: performance.now() - lintStart,
    });
  } else {
    logger.debug({ message: 'Linting skipped', group: 'parser', label: 'lint' });
  }

  return {
    tokens,
    document,
    src,
  };
}
