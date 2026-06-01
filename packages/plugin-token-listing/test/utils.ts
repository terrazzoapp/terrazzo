import type { TokenNormalized } from '@terrazzo/token-tools';

export function createMockToken(
  id: string,
  $type: any = 'color',
  mode: any = { '.': { $value: 'test-value' } },
  value: any = 'test-value',
): TokenNormalized {
  return {
    id,
    $type,
    mode,
    $value: value,
    $description: undefined,
    $extensions: undefined,
    aliasOf: undefined,
  } as TokenNormalized;
}
