import type {ParsedToken} from '@cobalt-ui/core';

function camelCase(inputString: string): string {
  return inputString
    .trim()
    .split(' ')
    .map((word, i) => {
      if (i === 0) {
        return word.toLowerCase();
      } else {
        return word[0]?.toUpperCase() + word.slice(1).toLowerCase();
      }
    })
    .join('');
}

export const DASH_PREFIX_RE = /^-+/;
const DASH_SUFFIX_RE = /-+$/;

/**
 * @param variableId dot separated path to the token, possibly with type specific modifications (such as composite token property names)
 */
export function defaultNameGenerator(
  variableId: string,
  // TODO: remove prefix arg in next major version
  prefix?: string,
): string {
  const normalizedPrefix = prefix ? `${prefix.replace(DASH_PREFIX_RE, '').replace(DASH_SUFFIX_RE, '')}-` : '';
  return `--${normalizedPrefix}${variableId.split('.').map(camelCase).join('-')}`;
}

export type CustomNameGenerator = (variableId: string, token?: ParsedToken) => string;

// TODO: remove prefix arg in next major version
export function makeNameGenerator(customNameGenerator?: CustomNameGenerator, prefix?: string) {
  /**
   * @param variableId dot separated path to the token, possibly with type specific modifications (such as composite token property names)
   */
  return (variableId: string, token: ParsedToken): string => {
    if (customNameGenerator) {
      const name = customNameGenerator(variableId, token);
      return `--${name.replace(DASH_PREFIX_RE, '')}`;
    }
    return defaultNameGenerator(variableId, prefix);
  };
}
