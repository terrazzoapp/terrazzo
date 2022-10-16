/** indent string by level */
export function indent(input: string, level = 0): string {
  let startingWS = '';
  for (let n = 0; n < level; n++) {
    startingWS += '  ';
  }
  return `${startingWS}${input.trim()}`;
}
