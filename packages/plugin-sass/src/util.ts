import fs from 'fs';
import mime from 'mime';

/** encode file for CSS */
export function encode(fileName: string): string {
  const type = mime.getType(fileName);

  // https://css-tricks.com/probably-dont-base64-svg/
  if (type === 'image/svg+xml') {
    return `url(${type};utf8,${fs.readFileSync(fileName, 'utf8')})`;
  }

  return `url(${type};base64,${fs.readFileSync(fileName).toString('base64')})`;
}

/** format font stack */
export function formatFontNames(fontNames: string[]): string {
  return fontNames.map((n) => (n.includes(' ') ? `"${n}"` : n)).join(', ');
}
