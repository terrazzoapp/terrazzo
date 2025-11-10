import type { DocumentNode } from '@humanwhocodes/momoa';
import { maybeRawJSON } from '@terrazzo/json-schema-tools';
import type yamlToMomoa from 'yaml-to-momoa';
import { toMomoa } from '../lib/momoa.js';
import type Logger from '../logger.js';
import type { InputSource, ResolverNormalized } from '../types.js';
import { normalizeResolver } from './normalize.js';
import { isLikelyResolver, validateResolver } from './validate.js';

export interface FindResolverOptions {
  logger: Logger;
  yamlToMomoa?: typeof yamlToMomoa;
}

/** Quick-parse input sources and find a resolver */
export async function loadResolver(
  inputs: Omit<InputSource, 'document'>[],
  { logger, yamlToMomoa }: FindResolverOptions,
): Promise<ResolverNormalized | undefined> {
  let resolverDoc: DocumentNode | undefined;
  const entry = {
    group: 'parser',
    label: 'init',
  } as const;

  for (const input of inputs) {
    let document: DocumentNode | undefined;
    if (typeof input.src === 'string') {
      if (maybeRawJSON(input.src)) {
        document = toMomoa(input.src);
      } else if (yamlToMomoa) {
        document = yamlToMomoa(input.src);
      } else {
        logger.error({
          ...entry,
          message: `Install yaml-to-momoa package to parse YAML, and pass in as option, e.g.:

  import { bundle } from '@terrazzo/json-schema-tools';
  import yamlToMomoa from 'yaml-to-momoa';

  bundle(yamlString, { yamlToMomoa });`,
        });
      }
    } else if (input.src && typeof input.src === 'object') {
      document = toMomoa(JSON.stringify(input.src, undefined, 2));
    } else {
      logger.error({ ...entry, message: `Could not parse ${input.filename}. Is this valid JSON or YAML?` });
    }
    if (!document || !isLikelyResolver(document)) {
      continue;
    }
    if (inputs.length > 1) {
      logger.error({ ...entry, message: `Resolver must be the only input, found ${inputs.length} sources.` });
    }
    resolverDoc = document;
    break;
  }

  if (resolverDoc) {
    validateResolver(resolverDoc, { logger, src: inputs[0]!.src });
    return await normalizeResolver(resolverDoc, {
      filename: inputs[0]!.filename!,
      logger,
      src: inputs[0]!.src,
      yamlToMomoa,
    });
  }
}
