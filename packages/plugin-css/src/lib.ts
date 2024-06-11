export const FORMAT_ID = 'css';

export const FILE_PREFIX = `/* -------------------------------------------
 *  Autogenerated by ⛋ Terrazzo. DO NOT EDIT!
 * ------------------------------------------- */`;

export interface CSSPluginOptions {
  /** Where to output CSS */
  filename?: string;
  /** Glob patterns to exclude tokens from output */
  exclude?: string[];
  /** Define mode selectors as media queries or CSS classes */
  modeSelectors?: ModeSelector[];
  /** Control the final CSS variable name */
  variableName?: (name: string) => string;
}

export interface ModeSelector {
  /** The name of the mode to match */
  mode: string;
  /** (optional) Provide token IDs to match. Globs are allowed (e.g: `["color.*", "shadow.dark"]`) */
  tokens?: string[];
  /** Provide CSS selectors to generate. (e.g.: `["@media (prefers-color-scheme: dark)", "[data-color-theme='dark']"]` ) */
  selectors: string[];
}

// note: this is NOT an adequate replacement for a CSS AST; this just performs
// basic deduplication and allows some limited parsing/reformatting before
// flattening to a CSS string.
export interface CSSRule {
  selectors: string[];
  nestedQuery?: string;
  declarations: Record<string, string>;
}

/** Convert CSSRules into a formatted, indented CSS string */
export function printRules(rules: CSSRule[]): string {
  const output: string[] = [];
  for (const rule of rules) {
    if (!rule.selectors.length || !Object.keys(rule.declarations).length) {
      continue;
    }

    const mqSelectors: string[] = [];
    const joinableSelectors: string[] = [];
    for (const s of rule.selectors) {
      (s.startsWith('@') ? mqSelectors : joinableSelectors).push(s);
    }
    // @media-query selectors get pushed individually
    for (const s of mqSelectors) {
      output.push(_printRule({ ...rule, selectors: [s] }));
    }
    // all other selectors get joined as one
    if (joinableSelectors.length) {
      output.push(_printRule({ ...rule, selectors: joinableSelectors }));
    }
  }
  return output.join('\n\n');
}

function _printRule(rule: CSSRule): string {
  const output: string[] = [];
  const isMediaQuery = rule.selectors.some((s) => s.startsWith('@'));
  let indent = '';

  // if both levels are media queries, preserve order
  if (rule.nestedQuery && isMediaQuery) {
    output.push(`${indent}${rule.selectors.join(`,\n${indent}`)} {`);
    indent += '  ';
    output.push(`${indent}${rule.nestedQuery} {`);
  }
  // otherwise if nested query exists but parens aren’t media queries, reverse order (media queries on top)
  else if (rule.nestedQuery && !isMediaQuery) {
    output.push(`${indent}${rule.nestedQuery} {`);
    indent += '  ';
    output.push(`${indent}${rule.selectors.join(`,\n${indent}`)} {`);
  }
  // if no media queries, just print selectors
  else {
    output.push(`${indent}${rule.selectors.join(`,\n${indent}`)} {`);
  }
  indent += '  ';

  // note: this is ONLY dependent on whether the top level is a media query (ignores nestedQuery)
  if (isMediaQuery) {
    output.push(`${indent}:root {`);
    indent += '  ';
  }

  for (const [k, v] of Object.entries(rule.declarations)) {
    output.push(`${indent}${k}: ${v};`);
  }

  // base closing brackets on indent level
  while (indent !== '') {
    indent = indent.substring(0, indent.length - 2);
    output.push(`${indent}}`);
  }

  return output.join('\n');
}

export interface GetRuleOptions {
  /** Combine a selector with parent selectors (e.g. if adding a @media-query within another selector list) */
  parentSelectors?: string[];
}