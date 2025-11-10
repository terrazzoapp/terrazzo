export function docsLink(ruleName: string): string {
  return `https://terrazzo.app/docs/linting#${ruleName.replaceAll('/', '')}`;
}
