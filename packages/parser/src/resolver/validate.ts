import * as momoa from '@humanwhocodes/momoa';
import { getObjMember, getObjMembers } from '@terrazzo/json-schema-tools';
import type { LogEntry, default as Logger } from '../logger.js';

/**
 * Determine whether this is likely a resolver
 * We use terms the word “likely” because this occurs before validation. Since
 * we may be dealing with a doc _intended_ to be a resolver, but may be lacking
 * some critical information, how can we determine intent? There’s a bit of
 * guesswork here, but we try and find a reasonable edge case where we sniff out
 * invalid DTCG syntax that a resolver doc would have.
 */
export function isLikelyResolver(doc: momoa.DocumentNode): boolean {
  if (doc.body.type !== 'Object') {
    return false;
  }
  // This is a resolver if…
  for (const member of doc.body.members) {
    if (member.name.type !== 'String') {
      continue;
    }
    switch (member.name.value) {
      case 'name':
      case 'description':
      case 'version': {
        // 1. name, description, or version are a string
        if (member.value.type === 'String') {
          return true;
        }
        break;
      }
      case 'sets':
      case 'modifiers': {
        if (member.value.type !== 'Object') {
          continue;
        }
        // 2. sets.description or modifiers.description is a string
        if (getObjMember(member.value, 'description')?.type === 'String') {
          return true;
        }
        // 3. sets.sources is an array
        if (member.name.value === 'sets' && getObjMember(member.value, 'sources')?.type === 'Array') {
          return true;
        } else if (member.name.value === 'modifiers') {
          const contexts = getObjMember(member.value, 'contexts');
          if (contexts?.type === 'Object' && contexts.members.some((m) => m.value.type === 'Array')) {
            // 4. contexts[key] is an array
            // (note: modifiers.contexts as an object is technically valid token format! We need to check for the array)
            return true;
          }
        }
        break;
      }
      case 'resolutionOrder': {
        // 4. resolutionOrder is an array
        if (member.value.type === 'Array') {
          return true;
        }
        break;
      }
    }
  }

  return false;
}

export interface ValidateResolverOptions {
  logger: Logger;
  src: string;
}

const MESSAGE_EXPECTED = {
  STRING: 'Expected string.',
  OBJECT: 'Expected object.',
  ARRAY: 'Expected array.',
};

/**
 * Validate a resolver document.
 * There’s a ton of boilerplate here, only to surface detailed code frames. Is there a better abstraction?
 */
export function validateResolver(node: momoa.DocumentNode, { logger, src }: ValidateResolverOptions) {
  const entry = { group: 'parser', label: 'resolver', src } as const;
  if (node.body.type !== 'Object') {
    logger.error({ ...entry, message: MESSAGE_EXPECTED.OBJECT, node });
  }
  const errors: LogEntry[] = [];

  let hasVersion = false;
  let hasResolutionOrder = false;

  for (const member of (node.body as momoa.ObjectNode).members) {
    if (member.name.type !== 'String') {
      continue; // IDK, don’t ask
    }

    switch (member.name.value) {
      case 'name':
      case 'description': {
        if (member.value.type !== 'String') {
          errors.push({ ...entry, message: MESSAGE_EXPECTED.STRING });
        }
        break;
      }

      case 'version': {
        hasVersion = true;
        if (member.value.type !== 'String' || member.value.value !== '2025.10') {
          errors.push({ ...entry, message: `Expected "version" to be "2025.10".`, node: member.value });
        }
        break;
      }

      case 'sets':
      case 'modifiers': {
        if (member.value.type !== 'Object') {
          errors.push({ ...entry, message: MESSAGE_EXPECTED.OBJECT, node: member.value });
        } else {
          for (const item of member.value.members) {
            if (item.value.type !== 'Object') {
              errors.push({ ...entry, message: MESSAGE_EXPECTED.OBJECT, node: item.value });
            } else {
              const validator = member.name.value === 'sets' ? validateSet : validateModifier;
              errors.push(...validator(item.value, false, { logger, src }));
            }
          }
        }
        break;
      }

      case 'resolutionOrder': {
        hasResolutionOrder = true;
        if (member.value.type !== 'Array') {
          errors.push({ ...entry, message: MESSAGE_EXPECTED.ARRAY, node: member.value });
        } else if (member.value.elements.length === 0) {
          errors.push({ ...entry, message: `"resolutionOrder" can’t be empty array.`, node: member.value });
        } else {
          for (const item of member.value.elements) {
            if (item.value.type !== 'Object') {
              errors.push({ ...entry, message: MESSAGE_EXPECTED.OBJECT, node: item.value });
            } else {
              const itemMembers = getObjMembers(item.value);
              if (itemMembers.$ref?.type === 'String') {
                continue; // we can’t validate this just yet, assume it’s correct
              }
              // Validate "type"
              if (itemMembers.type?.type === 'String') {
                if (itemMembers.type.value === 'set') {
                  validateSet(item.value, true, { logger, src });
                } else if (itemMembers.type.value === 'modifier') {
                  validateModifier(item.value, true, { logger, src });
                } else {
                  errors.push({
                    ...entry,
                    message: `Unknown type ${JSON.stringify(itemMembers.type.value)}`,
                    node: itemMembers.type,
                  });
                }
              }
              // validate sets & modifiers if they’re missing "type"
              if (itemMembers.sources?.type === 'Array') {
                validateSet(item.value, true, { logger, src });
              } else if (itemMembers.contexts?.type === 'Object') {
                validateModifier(item.value, true, { logger, src });
              } else if (itemMembers.name?.type === 'String' || itemMembers.description?.type === 'String') {
                validateSet(item.value, true, { logger, src }); // if this has a "name" or "description", guess set
              }
            }
          }
        }
        break;
      }
      case '$defs':
      case '$extensions':
        if (member.value.type !== 'Object') {
          errors.push({ ...entry, message: `Expected object`, node: member.value });
        }
        break;
      case '$schema':
      case '$ref': {
        if (member.value.type !== 'String') {
          errors.push({ ...entry, message: `Expected string`, node: member.value });
        }
        break;
      }
      default: {
        errors.push({ ...entry, message: `Unknown key ${JSON.stringify(member.name.value)}`, node: member.name, src });
        break;
      }
    }
  }

  // handle required keys
  if (!hasVersion) {
    errors.push({ ...entry, message: `Missing "version".`, node, src });
  }
  if (!hasResolutionOrder) {
    errors.push({ ...entry, message: `Missing "resolutionOrder".`, node, src });
  }

  if (errors.length) {
    logger.error(...errors);
  }
}

export function validateSet(node: momoa.ObjectNode, isInline = false, { src }: ValidateResolverOptions): LogEntry[] {
  const entry = { group: 'parser', label: 'resolver', src } as const;
  const errors: LogEntry[] = [];
  let hasName = !isInline;
  let hasType = !isInline;
  let hasSources = false;
  for (const member of node.members) {
    if (member.name.type !== 'String') {
      continue;
    }
    switch (member.name.value) {
      case 'name': {
        hasName = true;
        if (member.value.type !== 'String') {
          errors.push({ ...entry, message: MESSAGE_EXPECTED.STRING, node: member.value });
        }
        break;
      }
      case 'description': {
        if (member.value.type !== 'String') {
          errors.push({ ...entry, message: MESSAGE_EXPECTED.STRING, node: member.value });
        }
        break;
      }
      case 'type': {
        hasType = true;
        if (member.value.type !== 'String') {
          errors.push({ ...entry, message: MESSAGE_EXPECTED.STRING, node: member.value });
        } else if (member.value.value !== 'set') {
          errors.push({ ...entry, message: '"type" must be "set".' });
        }
        break;
      }
      case 'sources': {
        hasSources = true;
        if (member.value.type !== 'Array') {
          errors.push({ ...entry, message: MESSAGE_EXPECTED.ARRAY, node: member.value });
        } else if (member.value.elements.length === 0) {
          errors.push({ ...entry, message: `"sources" can’t be empty array.`, node: member.value });
        }
        break;
      }
      case '$defs':
      case '$extensions':
        if (member.value.type !== 'Object') {
          errors.push({ ...entry, message: `Expected object`, node: member.value });
        }
        break;
      case '$ref': {
        if (member.value.type !== 'String') {
          errors.push({ ...entry, message: `Expected string`, node: member.value });
        }
        break;
      }
      default: {
        errors.push({ ...entry, message: `Unknown key ${JSON.stringify(member.name.value)}`, node: member.name });
        break;
      }
    }
  }

  // handle required keys
  if (!hasName) {
    errors.push({ ...entry, message: `Missing "name".`, node });
  }
  if (!hasType) {
    errors.push({ ...entry, message: `"type": "set" missing.`, node });
  }
  if (!hasSources) {
    errors.push({ ...entry, message: `Missing "sources".`, node });
  }

  return errors;
}

export function validateModifier(
  node: momoa.ObjectNode,
  isInline = false,
  { src }: ValidateResolverOptions,
): LogEntry[] {
  const errors: LogEntry[] = [];
  const entry = { group: 'parser', label: 'resolver', src } as const;
  let hasName = !isInline;
  let hasType = !isInline;
  let hasContexts = false;
  for (const member of node.members) {
    if (member.name.type !== 'String') {
      continue;
    }
    switch (member.name.value) {
      case 'name': {
        hasName = true;
        if (member.value.type !== 'String') {
          errors.push({ ...entry, message: MESSAGE_EXPECTED.STRING, node: member.value });
        }
        break;
      }
      case 'description': {
        if (member.value.type !== 'String') {
          errors.push({ ...entry, message: MESSAGE_EXPECTED.STRING, node: member.value });
        }
        break;
      }
      case 'type': {
        hasType = true;
        if (member.value.type !== 'String') {
          errors.push({ ...entry, message: MESSAGE_EXPECTED.STRING, node: member.value });
        } else if (member.value.value !== 'modifier') {
          errors.push({ ...entry, message: '"type" must be "modifier".' });
        }
        break;
      }
      case 'contexts': {
        hasContexts = true;
        if (member.value.type !== 'Object') {
          errors.push({ ...entry, message: MESSAGE_EXPECTED.OBJECT, node: member.value });
        } else if (member.value.members.length === 0) {
          errors.push({ ...entry, message: `"contexts" can’t be empty object.`, node: member.value });
        } else {
          for (const context of member.value.members) {
            if (context.value.type !== 'Array') {
              errors.push({ ...entry, message: MESSAGE_EXPECTED.ARRAY, node: context.value });
            }
          }
        }
        break;
      }
      case 'default': {
        if (member.value.type !== 'String') {
          errors.push({ ...entry, message: `Expected string`, node: member.value });
        } else {
          const contexts = getObjMember(node, 'contexts') as momoa.ObjectNode | undefined;
          if (!contexts || !getObjMember(contexts, member.value.value)) {
            errors.push({ ...entry, message: 'Invalid default context', node: member.value });
          }
        }
        break;
      }
      case '$defs':
      case '$extensions':
        if (member.value.type !== 'Object') {
          errors.push({ ...entry, message: `Expected object`, node: member.value });
        }
        break;
      case '$ref': {
        if (member.value.type !== 'String') {
          errors.push({ ...entry, message: `Expected string`, node: member.value });
        }
        break;
      }
      default: {
        errors.push({ ...entry, message: `Unknown key ${JSON.stringify(member.name.value)}`, node: member.name });
        break;
      }
    }
  }

  // handle required keys
  if (!hasName) {
    errors.push({ ...entry, message: `Missing "name".`, node });
  }
  if (!hasType) {
    errors.push({ ...entry, message: `"type": "modifier" missing.`, node });
  }
  if (!hasContexts) {
    errors.push({ ...entry, message: `Missing "contexts".`, node });
  }

  return errors;
}
