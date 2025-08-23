export interface ParsedRef {
  /**
   * URL of the document. Could be a relative path or absolute URL with protocol. If referring to itself, it will be `.`
   * @default "."
   */
  url: string;
  /**
   * Subpath of the document, if any.
   * - "" → undefined (entire document)
   * - "#" → undefined (entire document)
   * - '#/foo/bar/baz' → ['foo', 'bar', 'baz']
   */
  subpath?: string[];
}

/**
 * Optimized JSON pointer parser.
 * @see https://datatracker.ietf.org/doc/html/rfc6901
 *
 * Requires no more than 2 passes maximum (couldn’t be done in a single pass
 * because the behavior changes based on whether we ever encounter a "#"
 * character, and we don’t know until we’ve made a full pass.
 */
export default function parseJSONPointer(ref: string): ParsedRef {
  const final: ParsedRef = { url: '.' };
  if (typeof ref !== 'string' || ref === '') {
    return final;
  }
  const [url, fragment] = ref.split('#'); // note: if a pointer has a 2nd fragment (#), it’s wrong. tough noogies.
  if (fragment) {
    return { url: url || '.', subpath: subpathFragment(fragment) };
  }
  if (url?.startsWith('/')) {
    return { url: '.', subpath: subpathFragment(url) };
  }
  return { url: url || '.' };
}

export function subpathFragment(fragment: string) {
  const subpath: string[] = [];
  let buff = '';
  for (let i = 0; i < fragment.length; i++) {
    const char = fragment[i];
    // ignore leading '/'
    if (i === 0 && char === '/') {
      continue;
    }
    if (char === '~') {
      if (fragment[i + 1] === '0') {
        buff += '~';
        i++;
        continue;
      }
      if (fragment[i + 1] === '1') {
        buff += '/';
        i++;
        continue;
      }
    } else if (char === '/') {
      if (buff) {
        subpath.push(buff);
        buff = '';
        continue;
      }
    }
    buff += char;
  }
  if (buff) {
    subpath.push(buff);
  }
  return subpath.length ? subpath : undefined;
}
