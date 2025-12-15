import * as momoa from '@humanwhocodes/momoa';
import {
  type BundleOptions,
  bundle,
  encodeFragment,
  getObjMember,
  type InputSource,
  type InputSourceWithDocument,
  replaceNode,
  traverse,
} from '@terrazzo/json-schema-tools';
import type { TokenNormalized, TokenNormalizedSet } from '@terrazzo/token-tools';
import { toMomoa } from '../lib/momoa.js';
import { filterResolverPaths } from '../lib/resolver-utils.js';
import type Logger from '../logger.js';
import { isLikelyResolver } from '../resolver/validate.js';
import type { ParseOptions, TransformVisitors } from '../types.js';
import { processTokens } from './process.js';

/** Ephemeral format that only exists while parsing the document. This is not confirmed to be DTCG yet. */
export interface IntermediaryToken {
  id: string;
  /** Was this token aliasing another? */
  $ref?: string;
  $type?: string;
  $description?: string;
  $deprecated?: string | boolean;
  $value: unknown;
  $extensions?: Record<string, unknown>;
  group: TokenNormalized['group'];
  aliasOf?: string;
  partialAliasOf?: Record<string, any> | any[];
  mode: Record<
    string,
    {
      $type?: string;
      $value: unknown;
      aliasOf?: string;
      partialAliasOf?: Record<string, any> | any[];
      source?: { filename?: URL; node: momoa.ObjectNode };
    }
  >;
  source: {
    filename?: URL;
    node: momoa.ObjectNode;
  };
}

export interface LoadOptions extends Pick<ParseOptions, 'config' | 'continueOnError' | 'yamlToMomoa' | 'transform'> {
  req: NonNullable<ParseOptions['req']>;
  logger: Logger;
}

export interface LoadSourcesResult {
  tokens: TokenNormalizedSet;
  sources: InputSourceWithDocument[];
}

/** Load from multiple entries, while resolving remote files */
export async function loadSources(
  inputs: InputSource[],
  { config, logger, req, continueOnError, yamlToMomoa, transform }: LoadOptions,
): Promise<LoadSourcesResult> {
  const entry = { group: 'parser' as const, label: 'init' };

  // 1. Bundle root documents together
  const firstLoad = performance.now();
  let document = {} as momoa.DocumentNode;

  /** The original user inputs, in original order, with parsed ASTs */
  const sources = inputs.map((input, i) => ({
    ...input,
    document: {} as momoa.DocumentNode,
    filename: input.filename || new URL(`virtual:${i}`), // for objects created in memory, an index-based ID helps associate tokens with these
  }));
  /** The sources array, indexed by filename */
  let sourceByFilename: Record<string, InputSourceWithDocument> = {};
  try {
    const result = await bundle(sources, {
      req,
      parse: transform ? transformer(transform) : undefined,
      yamlToMomoa,
    });
    document = result.document;
    sourceByFilename = result.sources;
    for (const [filename, source] of Object.entries(result.sources)) {
      const i = sources.findIndex((s) => s.filename.href === filename);
      if (i === -1) {
        sources.push(source);
      } else {
        sources[i]!.src = source.src; // this is a sanitized source that is easier to work with
        sources[i]!.document = source.document;
      }
    }
  } catch (err) {
    let src = sources.find((s) => s.filename.href === (err as any).filename)?.src;
    if (src && typeof src !== 'string') {
      src = JSON.stringify(src, undefined, 2);
    }
    logger.error({
      ...entry,
      continueOnError,
      message: (err as Error).message,
      node: (err as any).node,
      src,
    });
  }
  logger.debug({ ...entry, message: `JSON loaded`, timing: performance.now() - firstLoad });

  const rootSource = {
    filename: sources[0]!.filename!,
    document,
    src: momoa.print(document, { indent: 2 }).replace(/\\\//g, '/'),
  };

  return {
    tokens: processTokens(rootSource, { config, logger, sources, sourceByFilename }),
    sources,
  };
}

function transformer(transform: TransformVisitors): BundleOptions['parse'] {
  return async (src, filename) => {
    let document = toMomoa(src);
    let lastPath = '#/';
    let last$type: string | undefined;

    if (transform.root) {
      const result = transform.root(document, { filename, parent: undefined, path: [] });
      if (result) {
        document = result as momoa.DocumentNode;
      }
    }

    const isResolver = isLikelyResolver(document);
    traverse(document, {
      enter(node, parent, rawPath) {
        const path = isResolver ? filterResolverPaths(rawPath) : rawPath;
        if (node.type !== 'Object' || !path.length) {
          return;
        }
        const ctx = { filename, parent, path };
        const next$type = getObjMember(node, '$type');
        if (next$type?.type === 'String') {
          const jsonPath = encodeFragment(path);
          if (jsonPath.startsWith(lastPath)) {
            last$type = next$type.value;
          }
          lastPath = jsonPath;
        }
        if (getObjMember(node, '$value')) {
          let result: any = transform.token?.(structuredClone(node), ctx);
          if (result) {
            replaceNode(node, result);
            result = undefined;
          }
          result = transform[last$type as keyof typeof transform]?.(structuredClone(node as any), ctx);
          if (result) {
            replaceNode(node, result);
          }
        } else if (!path.includes('$value')) {
          const result = transform.group?.(structuredClone(node), ctx);
          if (result) {
            replaceNode(node, result);
          }
        }
      },
    });

    return document;
  };
}
