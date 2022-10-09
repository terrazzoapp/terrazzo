import fs from 'fs';
import mime from 'mime';
import {fileURLToPath} from 'url';
import svgo from 'svgo';

const LEADING_SLASH_RE = /^\//;
const URL_PREFIX = /^\s*url\(['"]?/;
const URL_SUFFIX = /['"]?\)\s*$/;

/** encode file for CSS */
export function encode(cssURL: string, cwd: URL): string {
  const filename = fileURLToPath(new URL(cssURL.replace(URL_PREFIX, '').replace(URL_SUFFIX, '').replace(LEADING_SLASH_RE, ''), cwd));
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

/** format font stack */
export function formatFontNames(fontNames: string[]): string {
  return fontNames.map((n) => (n.includes(' ') ? `"${n}"` : n)).join(', ');
}
