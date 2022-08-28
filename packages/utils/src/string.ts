export const CASECHANGE_RE = /[a-zâ-ž][A-ZÀ-Ž]/g;
export const KEBAB_COVERT_RE = /[_.]/g;
export const CAMEL_CONVERT_RE = /[^-_.\s][-_.\s]+[^-_.\s]/g;

/** convert string to kebab-case */
export function kebabinate(input: string): string {
  return input
    .replace(CASECHANGE_RE, (s) => `${s[0]}-${s[1]}`)
    .replace(KEBAB_COVERT_RE, '-')
    .toLocaleLowerCase();
}

/** convert input to camelCase */
export function camelize(input: string): string {
  return input.replace(CAMEL_CONVERT_RE, (s) => `${s[0].toLocaleLowerCase()}${s[s.length - 1].toLocaleUpperCase()}`);
}
