import * as momoa from '@humanwhocodes/momoa';

/** Momoa’s default parser, with preferred settings. */
export function toMomoa(srcRaw: any): momoa.DocumentNode {
  return momoa.parse(typeof srcRaw === 'string' ? srcRaw : JSON.stringify(srcRaw, undefined, 2), {
    mode: 'jsonc',
    ranges: true,
    tokens: true,
  });
}
