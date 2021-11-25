import fs from 'fs';
import mime from 'mime';

/** encode file for CSS */
export function encode(fileName: string): string {
  const type = mime.getType(fileName);

  // https://css-tricks.com/probably-dont-base64-svg/
  if (type === 'data:image/svg+xml') {
    return `url(${type};utf8,${fs.readFileSync(fileName, 'utf8')})`;
  }

  return `url(${type};base64,${fs.readFileSync(fileName).toString('base64')})`;
}

export function indent(text: string, level = 0): string {
  const space = new Array(2 * level + 1).join(' ');
  return text
    .split('\n')
    .map((ln) => `${space}${ln}`)
    .join('\n');
}
