import wcmatch from '../wildcard-match.js';

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
