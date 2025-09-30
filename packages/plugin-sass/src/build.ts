import type { BuildHookOptions } from '@terrazzo/parser';
import { FORMAT_ID as CSS_FORMAT_ID } from '@terrazzo/plugin-css';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import wcmatch from 'wildcard-match';
import { FILE_HEADER, MIXIN_TOKEN, MIXIN_TYPOGRAPHY, type SassPluginOptions } from './lib.js';

export interface BuildParams {
  getTransforms: BuildHookOptions['getTransforms'];
  options?: SassPluginOptions;
}

export default function build({ getTransforms, options }: BuildParams): string {
  const tokens = getTransforms({ format: CSS_FORMAT_ID, id: '*', mode: '.' });

  const output: string[] = [FILE_HEADER, ''];

  const shouldExclude = wcmatch(options?.exclude ?? []);

  // main values
  output.push('$__token-values: (');
  for (const token of tokens) {
    if (shouldExclude(token.token.id)) {
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

  const typographyTokens = getTransforms({ format: CSS_FORMAT_ID, id: '*', mode: '.', $type: 'typography' });
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
