/** UTF-8 char ranges */
export const CHARACTER_RE = [
  '0-9', // Numeric
  'A-Za-z', // Basic Latin
  '_$', // valid symbols
  '\u00C0-\u00FF', // Latin-1 Supplement
  '\u0100-\u017F', // Latin Extended-A
  '\u0180-\u024F', // Latin Extended-B
  '\u0370-\u03FF', // Greek & Coptic
  '\u0400-\u04FF', // Cyrillic
  '\u0530-\u058F', // Armenian
  '\u0590-\u05FF', // Hebrew
  '\u0600-\u06FF', // Arabic
  '\u0900-\u097F', // Devanagari
  '\u1100-\u11FF', // Hangul Jamo
  '\u3040-\u309F', // Hiragana
  '\u30A0-\u30FF', // Katakana
  '\u3400-\u4DBF', // CJK Extension A
  '\u4E00-\u9FFF', // CJK
];

export const STARTS_WITH_NUMBER_RE = /^[0-9]/;
export const CASECHANGE_RE = /[a-zâ-ž][A-ZÀ-Ž]/g;
export const KEBAB_COVERT_RE = /[_.]/g;
export const CAMEL_CONVERT_RE = /[^-_.\s][-_.\s]+[^-_.\s]/g;
export const LB_RE = /\r?\n\s*/g;

export const VALID_KEY = new RegExp(`^[${CHARACTER_RE.join('')}]+$`);

/** convert string to kebab-case */
export function kebabinate(input: string): string {
  return input
    .replace(CASECHANGE_RE, (s) => `${s[0]}-${s[1]}`)
    .replace(KEBAB_COVERT_RE, '-')
    .toLocaleLowerCase();
}

/** convert input to camelCase */
export function camelize(input: string): string {
  if (input.length < 2) {
    return input;
  }
  return input.replace(CAMEL_CONVERT_RE, (s) => `${s[0]!.toLocaleLowerCase()}${s[s.length - 1]!.toLocaleUpperCase()}`);
}

/** wrap bad obj keynames in strings */
export function objKey(name: string, wrapper = "'"): string {
  if (STARTS_WITH_NUMBER_RE.test(name)) {
    return `${wrapper}${name}${wrapper}`; // keys that start with a number get wrapper
  }
  return VALID_KEY.test(name) ? name : `${wrapper}${name}${wrapper}`;
}

/** pad string lengths */
export function padStr(input: string, length: number, alignment: 'left' | 'center' | 'right' = 'left'): string {
  const d =
    Math.min(length || 0, 1000) - // guard against NaNs and Infinity
    input.length;
  if (d > 0) {
    switch (alignment) {
      case 'left': {
        return `${input}${' '.repeat(d)}`;
      }
      case 'right': {
        return `${' '.repeat(d)}${input}`;
      }
      case 'center': {
        const left = Math.floor(d / 2);
        const right = d - left;
        return `${' '.repeat(left)}${input}${' '.repeat(right)}`;
      }
    }
  }
  return input;
}

/** indent an individual line */
export function indentLine(input: string, level = 0): string {
  return `${' '.repeat(2 * (level || 0))}${input.trim()}`;
}

export { indentLine as indent };

/** indent a block of text with spaces */
export function indentBlock(input: string, spaces: number): string {
  return `${' '.repeat(spaces)}${input.trim().replace(LB_RE, `\n${' '.repeat(spaces)}`)}`;
}
