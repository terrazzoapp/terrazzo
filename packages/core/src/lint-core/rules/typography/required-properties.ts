import { type ParsedToken } from '../../../token.js';

export interface RuleTypographyRequiredPropertiesOptions {
  /** Required typography properties */
  properties: string[];
}

export default function ruleTypographyRequiredProperties(tokens: ParsedToken[], options?: RuleTypographyRequiredPropertiesOptions): string[] {
  const notices: string[] = [];

  if (!options) {
    return notices;
  }

  if (!options.properties.length) {
    throw new Error(`"properties" can’t be empty`);
  }

  for (const t of tokens) {
    if (t.$type !== 'typography') {
      continue;
    }
    for (const p of options.properties) {
      if (!(p in t.$value)) {
        notices.push(`Token ${t.id}: missing required typographic property "${p}"`);
      }
    }
  }

  return notices;
}
