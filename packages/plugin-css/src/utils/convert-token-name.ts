const DASH_PREFIX_RE = /^-+/;
const DASH_SUFFIX_RE = /-+$/;

function convertId(id: string, spaceReplacement: string = '_'): string {
  return id
    .trim()
    .split('.')
    .map((groupOrTokenName) => groupOrTokenName.trim().replaceAll(' ', spaceReplacement))
    .join('-');
}

/** convert token name to CSS variable */
export function varName(id: string, options?: {prefix?: string; suffix?: string; spaceReplacement?: string}): string {
  return ['--', options?.prefix ? `${options.prefix.replace(DASH_PREFIX_RE, '').replace(DASH_SUFFIX_RE, '')}-` : '', convertId(id, options?.spaceReplacement), options?.suffix ? `-${options.suffix.replace(DASH_PREFIX_RE, '')}` : ''].join(
    '',
  );
}
