import type { BuildHookOptions } from '@terrazzo/parser';
import { FORMAT_ID } from '@terrazzo/plugin-css';
import { isTokenMatch } from '@terrazzo/token-tools';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import { FILE_HEADER, MIXIN_TOKEN, MIXIN_TYPOGRAPHY, type SassPluginOptions } from './lib.js';

export interface BuildParams {
  getTransforms: BuildHookOptions['getTransforms'];
  options?: SassPluginOptions;
}

export default function build({ getTransforms, options }: BuildParams): string {
  const tokens = getTransforms({ format: FORMAT_ID, id: '*', mode: '.' });

  const output: string[] = [FILE_HEADER, ''];

  // main values
  output.push('$__token-values: (');
  for (const token of tokens) {
    if (isTokenMatch(token.token.id, options?.exclude ?? [])) {
      continue;
    }
    // typography tokens handled later
    if (token.token.$type === 'typography') {
      output.push(`  "${token.token.id}": (
    "__tz-error": 'This is a typography mixin. Use \`@include typography("${token.token.id}")\` instead.',
  ),`);
    } else {
      const name = token.localID ?? token.token.id;
      output.push(`  "${token.token.id}": (${makeCSSVar(name, { wrapVar: true })}),`);
    }
  }
  output.push(');', '');

  // typography mixins
  output.push('$__token-typography-mixins: (');

  const typographyTokens = getTransforms({ format: 'css', id: '*', mode: '.', $type: 'typography' });
  for (const token of typographyTokens) {
    output.push(`  "${token.token.id}": (`);
    for (const property of Object.keys(token.value)) {
      const name = `${token.localID ?? token.token.id}-${property}`;
      output.push(`    "${property}": (${makeCSSVar(name, { wrapVar: true })}),`);
    }
    output.push('  ),');
  }
  output.push(');', '');

  output.push(MIXIN_TOKEN, '', MIXIN_TYPOGRAPHY, '');

  return output.join('\n');
}
