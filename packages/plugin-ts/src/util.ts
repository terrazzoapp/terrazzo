const alphanumRE = /^[A-Za-z0-9_]+$/;

/** Does a string need quotes to be an object property? */
export function prop(name: string): string {
  return alphanumRE.test(name) ? name : `'${name.replace(/'/g, "\\'")}'`;
}

/** Indent */
export function indent(source: string, level = 0): string {
  const space = new Array(2 * level + 1).join(' ');
  return source
    .split('\n')
    .map((ln) => `${space}${ln}`)
    .join('\n');
}
