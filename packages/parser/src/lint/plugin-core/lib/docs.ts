export function docsLink(ruleName: string): string {
  return `https://terrazzo.app/docs/cli/lint#${ruleName.replaceAll('/', '-')}`;
}
