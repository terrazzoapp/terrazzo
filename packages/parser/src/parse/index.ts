import { type DocumentNode, evaluate, type MemberNode, type ObjectNode } from '@humanwhocodes/momoa';
import { pluralize, splitID, type Token, type TokenNormalized } from '@terrazzo/token-tools';
import type ytm from 'yaml-to-momoa';
import lintRunner from '../lint/index.js';
import Logger from '../logger.js';
import type { ConfigInit, InputSource } from '../types.js';
import applyAliases from './alias.js';
import { getObjMembers, parseJSON, replaceObjMembers, toMomoa, traverse } from './json.js';
import normalize from './normalize.js';
import validateTokenNode, { getInheritedType, type Visitors } from './validate.js';

export * from './alias.js';
export * from './json.js';
export * from './normalize.js';
export * from './validate.js';
export { normalize, validateTokenNode };

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
  /**
   * Transform API
   * @see https://terrazzo.app/docs/api/js#transform-api
   */
  transform?: Visitors;
  /** (internal cache; do not use) */
  _sources?: Record<string, InputSource>;
}

export interface ParseResult {
  tokens: Record<string, TokenNormalized>;
  sources: InputSource[];
}

/** Parse */
export default async function parse(
  _input: Omit<InputSource, 'document'> | Omit<InputSource, 'document'>[],
  {
    logger = new Logger(),
    skipLint = false,
    config = {} as ConfigInit,
    continueOnError = false,
    yamlToMomoa,
    transform,
    _sources = {},
  }: ParseOptions = {} as ParseOptions,
): Promise<ParseResult> {
  const input = Array.isArray(_input) ? _input : [_input];
  let tokensSet: Record<string, TokenNormalized> = {};

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
        transform,
      });
      tokensSet = Object.assign(tokensSet, result.tokens);
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
  for (const [id, token] of Object.entries(tokensSet)) {
    applyAliases(token, {
      tokensSet,
      filename: _sources[token.source.loc!]?.filename!,
      src: _sources[token.source.loc!]?.src as string,
      node: (getObjMembers(token.source.node).$value as any) || token.source.node,
      logger,
    });
    aliasCount++;
    const { group: parentGroup } = splitID(id);
    if (parentGroup) {
      for (const siblingID of Object.keys(tokensSet)) {
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
    tokens: tokensSet,
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
    transform,
    yamlToMomoa, // optional dependency, declared here so the parser itself doesn’t have to load a heavy dep in-browser
  }: {
    filename: URL;
    logger: Logger;
    config: ConfigInit;
    skipLint: boolean;
    continueOnError?: boolean;
    transform: ParseOptions['transform'] | undefined;
    yamlToMomoa?: typeof ytm;
  },
): Promise<{ tokens: Record<string, Token>; document: DocumentNode; src?: string }> {
  // 1. Build AST
  const startParsing = performance.now();
  let { src, document } = toMomoa(input, { filename, logger, continueOnError, yamlToMomoa });
  logger.debug({
    group: 'parser',
    label: 'json',
    message: 'Finish JSON parsing',
    timing: performance.now() - startParsing,
  });
  const tokensSet: Record<string, TokenNormalized> = {};

  // 1a. if there’s a root() transformer, then re-parse
  if (transform?.root) {
    const json = typeof input === 'string' ? JSON.parse(input) : input;
    const result = transform?.root(json, '.', document);
    if (result) {
      const reRunResult = toMomoa(result, { filename, logger, continueOnError /* YAML not needed in transform() */ });
      src = reRunResult.src;
      document = reRunResult.document;
    }
  }

  // 2. Walk AST to validate tokens
  let tokenCount = 0;
  const startValidate = performance.now();
  const $typeInheritance: Record<string, MemberNode> = {};
  traverse(document, {
    enter(node, parent, subpath) {
      // if $type appears at root of tokens.json, collect it
      if (node.type === 'Document' && node.body.type === 'Object' && node.body.members) {
        const { members: rootMembers } = node.body;
        const root$type = rootMembers.find((m) => m.name.type === 'String' && m.name.value === '$type');
        const root$value = rootMembers.find((m) => m.name.type === 'String' && m.name.value === '$value');
        if (root$type && !root$value) {
          $typeInheritance['.'] = root$type;
        }
      }

      // for transform() visitors, all non-tokens MUST be handled at this point (besides "root", which was handled above)
      if (
        node.type === 'Object' && // JSON object
        subpath.length &&
        !node.members.some((m) => m.name.type === 'String' && m.name.value === '$value') && // not the token node itself
        !subpath.includes('$value') && // not a child of a token node, either
        !subpath.includes('$extensions') // not metadata
      ) {
        if (transform?.group) {
          const newJSON = transform?.group(evaluate(node), subpath.join('.'), node);
          if (newJSON) {
            replaceObjMembers(node, parseJSON(newJSON));
          }
        }
      }

      // handle tokens
      if (node.type === 'Member') {
        const inheritedTypeNode = getInheritedType(node, { subpath, $typeInheritance });
        if (node.value.type === 'Object') {
          const $type =
            node.value.members.find((m) => m.name.type === 'String' && m.name.value === '$type') || inheritedTypeNode;
          const $value = node.value.members.find((m) => m.name.type === 'String' && m.name.value === '$value');
          if ($value && $type?.value.type === 'String' && transform?.[$type.value.value]) {
            const result = transform[$type.value.value]?.(evaluate(node.value), subpath.join('.'), node);
            if (result) {
              node.value = parseJSON(result).body;
            }
          }

          const token = validateTokenNode(node, {
            filename,
            src,
            config,
            logger,
            parent,
            subpath,
            transform,
            inheritedTypeNode,
          });
          if (token) {
            tokensSet[token.id] = token;
            tokenCount++;
          }
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

  // 3. normalize values
  const normalizeStart = performance.now();
  for (const [id, token] of Object.entries(tokensSet)) {
    try {
      tokensSet[id]!.$value = normalize(token);
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
        tokensSet[id]!.mode[mode]!.$value = normalize({ $type: token.$type, ...modeValue });
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

  // 4. Execute lint runner with loaded plugins
  if (!skipLint && config?.plugins?.length) {
    const lintStart = performance.now();
    await lintRunner({ tokens: tokensSet, src, config, logger });
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
    tokens: tokensSet,
    document,
    src,
  };
}
