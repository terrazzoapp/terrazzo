import * as momoa from '@humanwhocodes/momoa';
import { bundle, getObjMember, getObjMembers, parseRef } from '@terrazzo/json-schema-tools';
import type yamlToMomoa from 'yaml-to-momoa';
import type Logger from '../logger.js';
import type {
  ResolverModifierInline,
  ResolverModifierNormalized,
  ResolverSetInline,
  ResolverSetNormalized,
  ResolverSourceNormalized,
} from '../types.js';
import { validateModifier, validateSet } from './validate.js';

export interface NormalizeResolverOptions {
  logger: Logger;
  yamlToMomoa?: typeof yamlToMomoa;
  filename: URL;
  req: (url: URL, origin: URL) => Promise<string>;
  src?: any;
}

/** Normalize resolver (assuming it’s been validated) */
export async function normalizeResolver(
  node: momoa.DocumentNode,
  { filename, req, src, logger, yamlToMomoa }: NormalizeResolverOptions,
): Promise<ResolverSourceNormalized> {
  const resolverSource = momoa.evaluate(node) as unknown as ResolverSourceNormalized;
  const resolutionOrder = getObjMember(node.body as momoa.ObjectNode, 'resolutionOrder') as momoa.ArrayNode;

  return {
    name: resolverSource.name,
    version: resolverSource.version,
    description: resolverSource.description,
    sets: resolverSource.sets,
    modifiers: resolverSource.modifiers,
    resolutionOrder: await Promise.all(
      resolutionOrder.elements.map(async (element, i) => {
        const layer = element.value as momoa.ObjectNode;
        const members = getObjMembers(layer);

        // If this is an inline set or modifier it’s already been validated; we only need
        // to resolve & validate $refs here which haven’t yet been parsed
        let item = layer as unknown as ResolverSetInline | ResolverModifierInline;

        // 1. $ref
        if (members.$ref) {
          const entry = { group: 'parser', label: 'init', node: members.$ref, src } as const;
          const { url, subpath } = parseRef((members.$ref as unknown as momoa.StringNode).value);
          if (url === '.') {
            // 1a. local $ref: pull from local document
            if (!subpath?.[0]) {
              logger.error({ ...entry, message: '$ref can’t refer to the root document.' });
            } else if (subpath[0] !== 'sets' && subpath[0] !== 'modifiers') {
              // Note: technically we could allow $defs, but that’s just unnecessary shenanigans here.
              logger.error({
                ...entry,
                message: 'Local $ref in resolutionOrder must point to either #/sets/[set] or #/modifiers/[modifiers].',
              });
            } else {
              const resolvedItem = resolverSource[subpath[0] as 'sets' | 'modifiers']?.[subpath[1]!];
              if (!resolvedItem) {
                logger.error({ ...entry, message: 'Invalid $ref' });
              } else {
                item = {
                  type: subpath[0] === 'sets' ? 'set' : 'modifier',
                  ...(resolvedItem as any), // Note: as long as this exists, this has already been validated to be correct
                };
              }
            }
          } else {
            // 1b. remote $ref: load and validate
            const result = await bundle(
              [{ filename: new URL(url, filename), src: resolverSource.resolutionOrder[i]! }],
              {
                req,
                yamlToMomoa,
              },
            );
            if (result.document.body.type === 'Object') {
              const type = getObjMember(result.document.body, 'type');
              if (type?.type === 'String' && type.value === 'set') {
                validateSet(result.document.body as momoa.ObjectNode, true, src);
                item = momoa.evaluate(result.document.body) as unknown as ResolverSetInline;
              } else if (type?.type === 'String' && type.value === 'modifier') {
                validateModifier(result.document.body as momoa.ObjectNode, true, src);
                item = momoa.evaluate(result.document.body) as unknown as ResolverModifierInline;
              }
            }
            logger.error({ ...entry, message: '$ref did not resolve to a valid Set or Modifier.' });
          }
        }

        // 2. resolve inline sources & contexts
        const finalResult = await bundle([{ filename, src: item }], { req, yamlToMomoa });
        return momoa.evaluate(finalResult.document.body) as unknown as
          | ResolverSetNormalized
          | ResolverModifierNormalized;
      }),
    ),
  };
}
