const alphanumRE = /^[A-Za-z0-9_]+$/;

export function prop(name: string): string {
  return alphanumRE.test(name) ? name : `'${name.replace(/'/g, "\\'")}'`;
}
