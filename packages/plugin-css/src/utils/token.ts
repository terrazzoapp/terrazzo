import {ParsedToken} from '@cobalt-ui/core';
import {isAlias} from '@cobalt-ui/utils';

export {isTokenMatch} from '@cobalt-ui/utils';

const DASH_PREFIX_RE = /^-+/;
const DASH_SUFFIX_RE = /-+$/;

export function getMode<T extends {id: string; $value: any; $extensions?: any; _original: any}>(token: T, mode?: string): {value: T['$value']; originalVal: T['$value'] | string} {
  if (mode) {
    if (!token.$extensions?.mode || !token.$extensions.mode[mode]) {
      throw new Error(`Token ${token.id} missing "$extensions.mode.${mode}"`);
    }
    return {
      value: token.$extensions.mode[mode]!,
      originalVal: token._original.$extensions.mode[mode]!,
    };
  }
  return {value: token.$value, originalVal: token._original.$value};
}

/**
 * Reference an existing CSS var
 */
export function varRef(
  id: string,
  options?: {
    prefix?: string;
    suffix?: string;
    // note: the following properties are optional to preserve backwards-compat without a breaking change
    tokens?: ParsedToken[];
    generateName?: ReturnType<typeof makeNameGenerator>;
  },
): string {
  let refID = id;
  if (isAlias(id)) {
    // unclear if mode is ever appended to id when passed here, but leaving for safety in case
    const [rootID, _mode] = id.substring(1, id.length - 1).split('#');
    refID = rootID!;
  }

  const token = options?.tokens?.find((t) => t.id === refID);

  if (!token) {
    console.warn(`Tried to reference variable with id: ${refID}, no token found`); // eslint-disable-line no-console
  }

  // suffix is only used internally (one place in plugin-sass), so handle it here rather than clutter the public API in defaultNameGenerator
  const normalizedSuffix = options?.suffix ? `-${options?.suffix.replace(DASH_PREFIX_RE, '')}` : '';
  const variableId = refID + normalizedSuffix;

  return `var(${options?.generateName?.(variableId, token) ?? defaultNameGenerator(variableId, options?.prefix)})`;
}

function normalizeIdSegment(inputString: string): string {
  const words = inputString.trim().split(' ');

  /* Only camelCase id segments if they have a middle space.
  This prevents a breaking change to names that have capitals but no spaces. */
  if (words.length > 1) {
    return words
      .map((word, i) => {
        if (i === 0) {
          return word.toLocaleLowerCase();
        } else {
          return word[0]?.toLocaleUpperCase() + word.slice(1).toLocaleLowerCase();
        }
      })
      .join('');
  }

  return words[0]!;
}

export function defaultNameGenerator(
  /** dot separated path to token with possible type specific modifications (such as appended composite token property names)  */
  variableId: string,
  /** @deprecated implement prefixes directly in `generateName` instead */
  prefix?: string,
): string {
  const normalizedPrefix = prefix ? `${prefix.replace(DASH_PREFIX_RE, '').replace(DASH_SUFFIX_RE, '')}-` : '';
  return `${normalizedPrefix}${variableId.split('.').map(normalizeIdSegment).join('-')}`;
}

export type CustomNameGenerator = (variableId: string, token?: ParsedToken) => string | undefined | null;

// TODO: remove prefix arg in next major version
export function makeNameGenerator(customNameGenerator?: CustomNameGenerator, prefix?: string) {
  return (
    /** dot separated path to token with possible type specific modifications (such as appended composite token property names)  */
    variableId: string,
    token?: ParsedToken,
  ): string => {
    const name = customNameGenerator?.(variableId, token) || defaultNameGenerator(variableId, prefix);

    return `--${name.replace(DASH_PREFIX_RE, '')}`;
  };
}
