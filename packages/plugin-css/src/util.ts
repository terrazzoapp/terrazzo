import mime from 'mime';
import fs from 'node:fs';
import {fileURLToPath, URL} from 'node:url';
import svgo from 'svgo';
import wcmatch from './wildcard-match.js';

const LEADING_SLASH_RE = /^\//;
const URL_PREFIX = /^\s*url\(['"]?/;
const URL_SUFFIX = /['"]?\)\s*$/;

/** encode file for CSS */
export function encode(cssURL: string, cwd: URL): string {
  const filename = fileURLToPath(new URL(cssURL.replace(URL_PREFIX, '').replace(URL_SUFFIX, '').replace(LEADING_SLASH_RE, ''), cwd));
  const type = mime.getType(filename);

  // https://css-tricks.com/probably-dont-base64-svg/
  if (type === 'image/svg+xml') {
    const svg = svgo.optimize(fs.readFileSync(filename, 'utf8'));
    if (svg.data) return `url('${type};utf8,${svg.data}')`;
  }

  return `url('${type};base64,${fs.readFileSync(filename).toString('base64')}')`;
}

/** format font stack */
export function formatFontNames(fontNames: string[]): string {
  return fontNames.map((n) => (n.includes(' ') ? `"${n}"` : n)).join(', ');
}

/** match token against globs */
export function isTokenMatch(tokenID: string, globPatterns: string[]): boolean {
  let isMatch = false;
  for (const tokenMatch of globPatterns) {
    if (wcmatch(tokenMatch)(tokenID)) {
      isMatch = true;
      break;
    }
  }
  return isMatch;
}
