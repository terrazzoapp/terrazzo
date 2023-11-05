import type {ParsedToken} from '@cobalt-ui/core';

function normalizeIdSegment(inputString: string): string {
  const words = inputString.trim().split(' ');

  /* Only camelCase id segments if they have a middle space.
  This prevents a breaking change to names that have capitals but no spaces. */
  if (words.length > 1) {
    return words
      .map((word, i) => {
        if (i === 0) {
          return word.toLowerCase();
        } else {
          return word[0]?.toUpperCase() + word.slice(1).toLowerCase();
        }
      })
      .join('');
  }

  return words[0]!;
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
  return `${normalizedPrefix}${variableId.split('.').map(normalizeIdSegment).join('-')}`;
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
