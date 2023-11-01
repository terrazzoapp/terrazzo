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
    .join();
}

const DASH_PREFIX_RE = /^-+/;
const DASH_SUFFIX_RE = /-+$/;

export function defaultNameGenerator(
  normalizedId: string,
  // TODO: remove prefix arg in next major version
  prefix?: string,
): string {
  const normalizedPrefix = prefix ? `${prefix.replace(DASH_PREFIX_RE, '').replace(DASH_SUFFIX_RE, '')}-` : '';
  return `--${normalizedPrefix}${normalizedId.split('.').map(camelCase).join('-')}`;
}

export type CustomNameGenerator = (normalizedId: string, token?: ParsedToken) => string;

export function makeNameGenerator(customNameGenerator?: CustomNameGenerator) {
  // TODO: remove prefix arg in next major version
  return (normalizedId: string, token: ParsedToken, prefix?: string): string => {
    if (customNameGenerator) {
      const name = customNameGenerator(normalizedId, token);
      return name.replace(DASH_PREFIX_RE, '--');
    }
    return defaultNameGenerator(normalizedId, prefix);
  };
}
