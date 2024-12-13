/** Pad string lengths */
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

/** Pluralize strings */
export function pluralize<T = string>(count: number, singular: T, plural: T): T {
  return count === 1 ? singular : plural;
}

/** Turn a string into kebab-case */
export function kebabCase(str: string): string {
  let output = '';
  for (const c of str.split('')) {
    if (c === '.') {
      output += '-';
      continue;
    }
    let isFirstUppercase = true;
    if (isFirstUppercase && /\p{Uppercase_Letter}/u.test(c)) {
      output += `-${c.toLocaleLowerCase()}`;
      isFirstUppercase = false; // don’t break apart multiple consecutive uppercase letters
      continue;
    } else {
      isFirstUppercase = true; // reset
    }

    output += c;
  }
  return output;
}
