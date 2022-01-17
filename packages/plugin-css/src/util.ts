import fs from 'fs';
import mime from 'mime';
import svgo from 'svgo';

/** encode file for CSS */
export function encode(fileName: string): string {
  const type = mime.getType(fileName);

  // https://css-tricks.com/probably-dont-base64-svg/
  if (type === 'image/svg+xml') {
    const svg = svgo.optimize(fs.readFileSync(fileName));
    if ((svg as any).data) {
      return `url('${type};utf8,${(svg as any).data}')`;
    }
  }

  return `url('${type};base64,${fs.readFileSync(fileName).toString('base64')}')`;
}
