import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Logger, Plugin, Resolver, TokenNormalized, TokenTransformed, TransformParams } from '@terrazzo/parser';
import {
  FORMAT_ID,
  type BuildListingExtensionOptions,
  type ListedTokenPlatform,
  type ModeOption,
  type PlatformOption,
  type TokenListing,
  type TokenListingExtension,
  type TokenListingPluginOptions,
} from './lib.js';
import { computePreviewValue } from './utils/previewValue.js';
import { error } from './utils/logger.js';

export * from './lib.js';

function lookupTransformed({
  getTransforms,
  plugin,
  mode,
  tokenID,
}: {
  getTransforms: (params: TransformParams) => TokenTransformed[];
  plugin: string;
  mode: string | undefined;
  tokenID: string;
}): TokenTransformed | undefined {
  const direct = getTransforms({ format: plugin, id: tokenID, mode });
  if (direct[0]) {
    return direct[0];
  }
  const fallback = getTransforms({ format: plugin.replace('@terrazzo/plugin-', ''), id: tokenID, mode });
  return fallback[0];
}

function pluginExists({
  getTransforms,
  plugin,
}: {
  getTransforms: (params: TransformParams) => TokenTransformed[];
  plugin: string;
}): boolean {
  return (
    getTransforms({ format: plugin, id: '*' }).length > 0 ||
    getTransforms({ format: plugin.replace('@terrazzo/plugin-', ''), id: '*' }).length > 0
  );
}

function getPluginField<T>({
  getTransforms,
  logger,
  mode,
  pid,
  plugin,
  field,
  token,
}: {
  getTransforms: (params: TransformParams) => TokenTransformed[];
  logger: Logger;
  mode: string | undefined;
  pid: string;
  plugin: string;
  field: 'name' | 'value' | 'deprecated';
  token: TokenNormalized;
}): T | undefined {
  const transformed = lookupTransformed({ getTransforms, plugin, mode, tokenID: token.id });
  if (transformed) {
    const meta = transformed.meta?.['token-listing'] as Record<string, unknown> | undefined;
    return meta?.[field] as T | undefined;
  }
  if (!pluginExists({ getTransforms, plugin })) {
    error(
      logger,
      `Could not find format "${plugin}" to compute token "${field}" for platform "${pid}", please check your configuration matches the format documented in the plugin you're attempting to use.`,
    );
  }
  return undefined;
}

function buildPlatformEntry({
  getTransforms,
  logger,
  mode,
  pid,
  platform,
  token,
  tokensSet,
}: {
  getTransforms: (params: TransformParams) => TokenTransformed[];
  logger: Logger;
  mode: string;
  pid: string;
  platform: PlatformOption;
  token: TokenNormalized;
  tokensSet: Record<string, TokenNormalized>;
}): ListedTokenPlatform | undefined {
  // Whole platform shorthand — plugin name string.
  if (typeof platform === 'string') {
    const name = getPluginField<string>({
      getTransforms,
      logger,
      mode,
      pid,
      plugin: platform,
      field: 'name',
      token,
    });
    if (!name) {
      return undefined;
    }
    const entry: ListedTokenPlatform = { name };
    const value = getPluginField<string>({
      getTransforms,
      logger,
      mode,
      pid,
      plugin: platform,
      field: 'value',
      token,
    });
    if (value !== undefined && value !== '') {
      entry.value = value;
    }
    const deprecated = getPluginField<string | boolean>({
      getTransforms,
      logger,
      mode,
      pid,
      plugin: platform,
      field: 'deprecated',
      token,
    });
    if (deprecated !== undefined) {
      entry.deprecated = deprecated;
    }
    return entry;
  }

  // Object form. Resolve filter first.
  let included = true;
  if (typeof platform.filter === 'string') {
    included = !!getPluginField<string>({
      getTransforms,
      logger,
      mode,
      pid,
      plugin: platform.filter,
      field: 'name',
      token,
    });
  } else if (typeof platform.filter === 'function') {
    included = platform.filter({ logger, mode, tokensSet, token });
  }
  if (!included) {
    return undefined;
  }

  // Resolve name.
  let name: string | undefined;
  if (typeof platform.name === 'string') {
    name = getPluginField<string>({
      getTransforms,
      logger,
      mode,
      pid,
      plugin: platform.name,
      field: 'name',
      token,
    });
  } else if (typeof platform.name === 'function') {
    name = platform.name({ logger, mode, tokensSet, token });
  }
  if (!name) {
    return undefined;
  }
  const entry: ListedTokenPlatform = { name };

  // Resolve value.
  let value: string | undefined;
  if (typeof platform.value === 'string') {
    value = getPluginField<string>({
      getTransforms,
      logger,
      mode,
      pid,
      plugin: platform.value,
      field: 'value',
      token,
    });
  } else if (typeof platform.value === 'function') {
    value = platform.value({ logger, mode, tokensSet, token });
  } else if (typeof platform.name === 'string') {
    // Implicit: when name is sourced from a plugin, also try to source value from it.
    value = getPluginField<string>({
      getTransforms,
      logger,
      mode,
      pid,
      plugin: platform.name,
      field: 'value',
      token,
    });
  }
  if (value !== undefined && value !== '') {
    entry.value = value;
  }

  // Resolve deprecated.
  let deprecated: string | boolean | undefined;
  if (typeof platform.deprecated === 'string') {
    deprecated = getPluginField<string | boolean>({
      getTransforms,
      logger,
      mode,
      pid,
      plugin: platform.deprecated,
      field: 'deprecated',
      token,
    });
  } else if (typeof platform.deprecated === 'function') {
    deprecated = platform.deprecated({ logger, mode, tokensSet, token });
  } else if (typeof platform.name === 'string') {
    // Implicit: when name is sourced from a plugin, also try to source deprecated from it.
    deprecated = getPluginField<string | boolean>({
      getTransforms,
      logger,
      mode,
      pid,
      plugin: platform.name,
      field: 'deprecated',
      token,
    });
  }
  if (deprecated !== undefined) {
    entry.deprecated = deprecated;
  }

  return entry;
}

function getPlatformDescription(platform: PlatformOption): { description?: string } {
  if (typeof platform === 'string') {
    return { description: `Automatically generated from ${platform}` };
  }
  return { description: platform.description };
}

function mapValues<T, U>(obj: Record<string, T>, fn: (value: T, key: string) => U): Record<string, U> {
  const out: Record<string, U> = {};
  for (const [key, value] of Object.entries(obj)) {
    out[key] = fn(value as T, key);
  }
  return out;
}

/**
 * Find which resolver entry (set or modifier context) contains the given token id at the given mode.
 * Returns an RFC 6901 same-document JSON Pointer string, or undefined if not found.
 */
function deriveVia({
  resolver,
  tokenID,
  mode,
}: {
  resolver: Resolver;
  tokenID: string;
  mode: string;
}): string | undefined {
  const path = tokenID.split('.');
  const containsToken = (group: unknown): boolean => {
    let node: unknown = group;
    for (const segment of path) {
      if (!node || typeof node !== 'object') {
        return false;
      }
      node = (node as Record<string, unknown>)[segment];
    }
    if (!node || typeof node !== 'object') {
      return false;
    }
    return '$value' in (node as Record<string, unknown>);
  };

  // Walk resolutionOrder backwards so the latest source wins.
  const items = resolver.source.resolutionOrder ?? [];
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i]!;
    if (item.type === 'set') {
      for (const source of item.sources) {
        if (containsToken(source)) {
          return `#/sets/${encodePointerSegment(item.name)}`;
        }
      }
    } else if (item.type === 'modifier') {
      // Try the listing's mode first if it matches one of this modifier's contexts.
      const ctxNames = Object.keys(item.contexts);
      const candidates: string[] = [];
      if (mode && ctxNames.includes(mode)) {
        candidates.push(mode);
      } else if (item.default && ctxNames.includes(item.default)) {
        candidates.push(item.default);
      }
      for (const ctxName of candidates) {
        for (const source of item.contexts[ctxName] ?? []) {
          if (containsToken(source)) {
            return `#/modifiers/${encodePointerSegment(item.name)}/contexts/${encodePointerSegment(ctxName)}`;
          }
        }
      }
    }
  }
  return undefined;
}

function encodePointerSegment(segment: string): string {
  return segment.replace(/~/g, '~0').replace(/\//g, '~1');
}

/** Convert a TokenNormalized's source filename to a path relative to the anchor (resolver dir or cwd). */
function relativeSourcePath(filename: string, anchor: string): string {
  let absolute = filename;
  if (filename.startsWith('file://')) {
    try {
      absolute = fileURLToPath(filename);
    } catch {
      absolute = filename;
    }
  }
  const relative = path.relative(anchor, absolute);
  // path.relative on POSIX uses /, on Windows uses \. Normalize to /.
  return relative.split(path.sep).join('/');
}

/** Build meta.groups from all tokens' immediate parent groups. */
function buildGroupsMeta(
  tokens: Record<string, TokenNormalized>,
): Record<string, { description?: string; deprecated?: string | boolean }> | undefined {
  const groups: Record<string, { description?: string; deprecated?: string | boolean }> = {};
  for (const token of Object.values(tokens)) {
    const g = token.group;
    if (!g?.id || groups[g.id]) {
      continue;
    }
    const entry: { description?: string; deprecated?: string | boolean } = {};
    if (typeof g.$description === 'string' && g.$description.length > 0) {
      entry.description = g.$description;
    }
    if (g.$deprecated !== undefined && g.$deprecated !== false) {
      entry.deprecated = g.$deprecated;
    }
    if (entry.description !== undefined || entry.deprecated !== undefined) {
      groups[g.id] = entry;
    }
  }
  return Object.keys(groups).length > 0 ? groups : undefined;
}

/**
 * When a resolver is present, errors out to encourage users to adopt a single source of truth
 * for modifiers.
 * 
 * When no resolver is present, allows teams to define modes for consumption by token listing,
 * matching the resolver syntax. Returns the merged modes array, or undefined.
 */
function resolveModes({
  configModes,
  resolver,
  logger,
}: {
  configModes: ModeOption[] | undefined;
  resolver: Resolver | undefined;
  logger: Logger;
}): ModeOption[] | undefined {
  if (!resolver) {
    return configModes?.length ? configModes : undefined;
  }

  error(
    logger,
    `You are using resolver.json. Modes are derived from the resolver; do not define them in the token listing plugin config.`,
  );
}

function computeMeta(
  options: TokenListingPluginOptions,
  resolvedModes: ModeOption[] | undefined,
   tokens: Record<string, TokenNormalized>,
): TokenListing['meta'] {
  const meta: TokenListing['meta'] = {
    version: 1,
    authoringTool: 'Terrazzo',
  };
  if (resolvedModes && resolvedModes.length > 0) {
    meta.modes = resolvedModes;
  }
  if (options.platforms && Object.keys(options.platforms).length > 0) {
    meta.platforms = mapValues(options.platforms, getPlatformDescription);
  }
  const groups = buildGroupsMeta(tokens);
  if (groups) {
    meta.groups = groups;
  }
  const sourceOfTruthMeta =
    typeof options.sourceOfTruth === 'string' ? options.sourceOfTruth : options.sourceOfTruth?.default;
  if (sourceOfTruthMeta) {
    meta.sourceOfTruth = sourceOfTruthMeta;

  }
  
  return meta;
}

function computeData(
  buildListingExtension: (options: BuildListingExtensionOptions) => TokenListingExtension,
  getTransforms: (params: TransformParams) => TokenTransformed[],
  logger: Logger,
  resolver: Resolver | undefined,
  resolverRootDir: string,
  tokens: Record<string, TokenNormalized>,
): TokenListing['data'] {
  return Object.values(tokens).flatMap((token) =>
    Object.entries(token.mode).map(([mode, tokenInMode]) => ({
      $name: token.id,
      $type: token.$type,
      ...(token.$description ? { $description: token.$description } : {}),
      $value: tokenInMode ? tokenInMode.$value : token.$value,
      ...(token.$deprecated !== undefined ? { $deprecated: token.$deprecated } : {}),
      $extensions: {
        [FORMAT_ID]: buildListingExtension({
          getTransforms,
          logger,
          mode,
          resolver,
          resolverRootDir,
          token,
          tokensSet: tokens,
        }),
      },
    })),
  );
}

export default function BuildTokenListing(options: TokenListingPluginOptions): Plugin['build'] {
  const { platforms = {} } = options;

  const buildListingExtension = ({
    getTransforms,
    logger,
    mode,
    resolver,
    resolverRootDir,
    token,
    tokensSet,
  }: BuildListingExtensionOptions): TokenListingExtension => {
    const computedPlatforms: Record<string, ListedTokenPlatform> = {};
    for (const [pid, platform] of Object.entries(platforms)) {
      const entry = buildPlatformEntry({ getTransforms, logger, mode, pid, platform, token, tokensSet });
      if (entry) {
        computedPlatforms[pid] = entry;
      }
    }

    const output: TokenListingExtension = {
      platforms: computedPlatforms,
    };

    // aliasChain
    const modeValue = token.mode[mode];
    const aliasChain = modeValue?.aliasChain ?? token.aliasChain;
    if (aliasChain && aliasChain.length > 0) {
      output.aliasChain = [...aliasChain];
    }

    // previewValue
    const previewRaw = options.previewValue?.({ logger, mode, tokensSet, token });
    let previewValue: string | undefined;
    if (typeof previewRaw === 'number') {
      previewValue = String(previewRaw);
    } else if (typeof previewRaw === 'string') {
      previewValue = previewRaw;
    } else {
      previewValue = computePreviewValue({ logger, mode, tokensSet, token });
    }
    if (previewValue && previewValue !== '') {
      output.previewValue = previewValue;
    }

    // subtype
    const subtype = options.subtype?.({ logger, mode, tokensSet, token });
    if (subtype) {
      output.subtype = subtype;
    }

    // mode
    if (mode !== '.') {
      output.mode = mode;
    }

    // sourceOfTruth (per-token)
    const sourceOfTruth =
      typeof options.sourceOfTruth === 'object'
        ? options.sourceOfTruth?.custom?.({ logger, mode, tokensSet, token })
        : undefined;
    if (sourceOfTruth) {
      output.sourceOfTruth = sourceOfTruth;
    }

    // source
    const sourceFilename = token.source?.filename;
    if (sourceFilename) {
      const filePath = relativeSourcePath(sourceFilename, resolverRootDir);
      // token.jsonID already starts with '#/'.
      const $ref = filePath ? `${filePath}${token.jsonID}` : token.jsonID;
      const sourceField: TokenListingExtension['source'] = { $ref };
      if (!(resolver)) {
        const via = deriveVia({ resolver: resolver!, tokenID: token.id, mode });
        if (via) {
          sourceField.via = via;
        }
      }
      const loc = token.source.node?.loc;
      if (loc) {
        sourceField.loc = {
          start: { line: loc.start.line, column: loc.start.column, offset: loc.start.offset },
          end: { line: loc.end.line, column: loc.end.column, offset: loc.end.offset },
        };
      }
      output.source = sourceField;
    }

    return output;
  };



  return async function build({ context: { logger }, getTransforms, outputFile, resolver, tokens }) {
    // Compute anchor: resolver dir if real resolver, cwd otherwise.
    let resolverRootDir = process.cwd();
    if (resolver) {
      const resolverFile = resolver.source._source.filename;
      if (resolverFile) {
        try {
          resolverRootDir = path.dirname(fileURLToPath(resolverFile));
        } catch {
          // Leave as cwd.
        }
      }
    }

    const resolvedModes = resolveModes({ configModes: options.modes, resolver, logger });

    const content: TokenListing = {
      meta: computeMeta(options, resolvedModes, tokens),
      data: computeData(buildListingExtension, getTransforms, logger, resolver, resolverRootDir, tokens),
    };

    // biome-ignore lint/suspicious/noExplicitAny: accounting for typos.
    const filename = options.filename ?? (options as any)?.fileName ?? 'tokens.listing.json';
    outputFile(filename, JSON.stringify(content, null, 2));
  };
}
