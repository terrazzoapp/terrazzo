const DASH_PREFIX_RE = /^-+/;
const DASH_SUFFIX_RE = /-+$/;
const DOT_UNDER_GLOB_RE = /[._]/g;

/** convert token name to CSS variable */
export function varName(id: string, options?: {prefix?: string; suffix?: string}): string {
  return ['--', options?.prefix ? `${options.prefix.replace(DASH_PREFIX_RE, '').replace(DASH_SUFFIX_RE, '')}-` : '', id.replace(DOT_UNDER_GLOB_RE, '-'), options?.suffix ? `-${options.suffix.replace(DASH_PREFIX_RE, '')}` : ''].join('');
}
