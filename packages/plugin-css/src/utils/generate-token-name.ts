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

export function defaultNameGenerator(
  /** dot separated path to token with possible type specific modifications (such as appended composite token property names)  */
  variableId: string,
  /** @deprecated implement prefixes directly in `generateName` instead */
  prefix?: string,
): string {
  const normalizedPrefix = prefix ? `${prefix.replace(DASH_PREFIX_RE, '').replace(DASH_SUFFIX_RE, '')}-` : '';
  return `${normalizedPrefix}${variableId.split('.').map(camelCase).join('-')}`;
}

export type CustomNameGenerator = (variableId: string, token?: ParsedToken) => string;

// TODO: remove prefix arg in next major version
export function makeNameGenerator(customNameGenerator?: CustomNameGenerator, prefix?: string) {
  return (
    /** dot separated path to token with possible type specific modifications (such as appended composite token property names)  */
    variableId: string,
    token: ParsedToken,
  ): string => {
    const name = customNameGenerator ? customNameGenerator(variableId, token) : defaultNameGenerator(variableId, prefix);

    return `--${name.replace(DASH_PREFIX_RE, '')}`;
  };
}
