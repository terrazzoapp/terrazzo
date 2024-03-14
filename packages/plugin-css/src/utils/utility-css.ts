import type { ParsedToken } from '@cobalt-ui/core';
import { getLocalID, kebabinate } from '@cobalt-ui/utils';
import { defaultNameGenerator, isTokenMatch } from './token.js';

export type UtilityCSSGroup = 'bg' | 'border' | 'font' | 'gap' | 'margin' | 'padding' | 'shadow' | 'text';

const ENDING_GLOB = /\.\*$/;
const STARTING_DOT = /^\./;

export default function generateUtilityCSS(groups: Record<UtilityCSSGroup, string[]>, { refs, tokens }: { refs: Record<string, string>; tokens: ParsedToken[] }): string {
  const output: string[] = [];

  const groupEntries = Object.entries(groups);
  groupEntries.sort((a, b) => a[0].localeCompare(b[0]));

  for (const [group, selectors] of groupEntries) {
    const selectedTokens: { id: string; partialID: string; type: ParsedToken['$type']; value: string | Record<string, string> }[] = [];
    for (const token of tokens) {
      const globMatch = isTokenMatch(token.id, selectors);
      if (globMatch) {
        let partialID = defaultNameGenerator(token.id.replace(globMatch.replace(ENDING_GLOB, ''), '').replace(STARTING_DOT, ''));
        if (!partialID) {
          partialID = getLocalID(token.id);
        }
        if (token.$type === 'typography') {
          const value: Record<string, string> = {};
          if (typeof token.$value === 'string') {
            continue;
          } // skip aliased token
          for (const k of Object.keys(token.$value)) {
            const property = kebabinate(k);
            value[property] = `var(${refs[token.id]}-${property});`;
          }
          selectedTokens.push({ id: token.id, partialID, type: token.$type, value });
        } else {
          selectedTokens.push({ id: token.id, partialID, type: token.$type, value: `var(${refs[token.id]})` });
        }
      }
    }
    if (!selectedTokens.length) {
      console.warn(`utility group "${group}" selected 0 tokens: ${JSON.stringify(selectors)}`); // eslint-disable-line no-console
      break;
    }

    switch (group) {
      case 'bg': {
        for (const token of selectedTokens) {
          if (token.type === 'color') {
            output.push(`.bg-${token.partialID} {
  background-color: ${token.value};
}`);
          } else if (token.type === 'gradient') {
            output.push(`.bg-${token.partialID} {
  background-image: linear-gradient(${token.value});
}`);
          }
        }
        break;
      }
      case 'border': {
        // ALL generic properties must come before specific properties
        for (const token of selectedTokens) {
          let property = '';
          if (token.type === 'border') {
            property = 'border';
          } else if (token.type === 'color') {
            property = 'border-color';
          } else if (token.type === 'dimension') {
            property = 'border-width';
          } else if (token.type === 'strokeStyle') {
            property = 'border-style';
          } else {
            continue;
          } // skip invalid token types

          output.push(`.border-${token.partialID} {
  ${property}: ${token.value};
}`);
        }
        for (const token of selectedTokens) {
          for (const dir of ['top', 'right', 'bottom', 'left']) {
            let property = '';
            if (token.type === 'border') {
              property = `border-${dir}`;
            } else if (token.type === 'color') {
              property = `border-${dir}-color`;
            } else if (token.type === 'dimension') {
              property = `border-${dir}-width`;
            } else if (token.type === 'strokeStyle') {
              property = `border-${dir}-style`;
            } else {
              continue;
            } // skip invalid token types

            output.push(`.border-${dir}-${token.partialID} {
  ${property}: ${token.value};
}`);
          }
        }
        break;
      }
      case 'font': {
        for (const token of selectedTokens) {
          if (token.type === 'typography' && token.value && typeof token.value === 'object') {
            output.push(`.font-${token.partialID} {`);
            for (const [k, v] of Object.entries(token.value)) {
              output.push(`  ${k}: ${v}`);
            }
            output.push('}');
          }
        }
        break;
      }
      case 'gap': {
        const filteredTokens = selectedTokens.filter((t) => t.type === 'dimension'); // only dimension tokens here

        // ALL generic properties (gap) must come before specific properties (column-gap)
        for (const token of filteredTokens) {
          output.push(`.gap-${token.partialID} {
  gap: ${token.value};
}`);
        }
        for (const token of filteredTokens) {
          output.push(`.gap-col-${token.partialID} {
  column-gap: ${token.value};
}`);
        }
        for (const token of filteredTokens) {
          output.push(`.gap-row-${token.partialID} {
  row-gap: ${token.value};
}`);
        }
        break;
      }
      case 'margin':
      case 'padding': {
        const filteredTokens = selectedTokens.filter((t) => t.type === 'dimension'); // only dimension tokens here
        const name = group === 'margin' ? 'm' : 'p';
        const property = group === 'margin' ? 'margin' : 'padding';

        // note: ALL generic properties (margin: [value]) MUST come before specific properties (margin-top: [value])
        // this is why we loop through all tokens so many times
        for (const token of filteredTokens) {
          output.push(`.${name}a-${token.partialID} {
  ${property}: ${token.value};
}`);
        }
        for (const token of filteredTokens) {
          output.push(`.${name}x-${token.partialID} {
  ${property}-left: ${token.value};
  ${property}-right: ${token.value};
}`);
          output.push(`.${name}y-${token.partialID} {
  ${property}-bottom: ${token.value};
  ${property}-top: ${token.value};
}`);
        }
        for (const dir of ['top', 'right', 'bottom', 'left']) {
          for (const token of filteredTokens) {
            output.push(`.${name}${dir[0]}-${token.partialID} {
  ${property}-${dir}: ${token.value};
}`);
          }
        }
        for (const token of filteredTokens) {
          output.push(`.${name}s-${token.partialID} {
  ${property}-inline-start: ${token.value};
}`);
          output.push(`.${name}e-${token.partialID} {
  ${property}-inline-end: ${token.value};
}`);
        }
        break;
      }
      case 'shadow': {
        for (const token of selectedTokens) {
          if (token.type !== 'shadow') {
            continue;
          }
          output.push(`.shadow-${token.partialID} {
  box-shadow: ${token.value};
}`);
        }
        break;
      }
      case 'text': {
        for (const token of selectedTokens) {
          if (token.type === 'color') {
            output.push(`.text-${token.partialID} {
  color: ${token.value};
}`);
          } else if (token.type === 'gradient') {
            output.push(`.text-${token.partialID} {
  background: -webkit-linear-gradient(${token.value});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}`);
          }
        }
        break;
      }
      default: {
        console.warn(`utility: unknown group "${group}", ignoring`); // eslint-disable-line no-console
        break;
      }
    }
  }

  return output.join('\n');
}
