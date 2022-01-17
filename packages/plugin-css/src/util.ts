import fs from 'fs';
import mime from 'mime';
import svgo from 'svgo';

/** encode file for CSS */
export function encode(filename: string): string {
  const type = mime.getType(filename);

  // https://css-tricks.com/probably-dont-base64-svg/
  if (type === 'image/svg+xml') {
    const svg = svgo.optimize(fs.readFileSync(filename));
    if ((svg as any).data) {
      return `url('${type};utf8,${(svg as any).data}')`;
    }
  }

  return `url('${type};base64,${fs.readFileSync(filename).toString('base64')}')`;
}
