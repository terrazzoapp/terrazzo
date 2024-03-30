import { camelCase, kebabCase, pascalCase, snakeCase } from 'scule';
import { type ParsedToken } from '../../token.js';

export interface RuleNamingOptions {
  /** Specify format, or custom naming validator */
  format: 'kebab-case' | 'camelCase' | 'PascalCase' | 'snake_case' | 'SCREAMING_SNAKE_CASE' | ((tokenID: string) => string | undefined);
  /** (optional) Token IDs to ignore. Supports globs (`*`). */
  ignore?: string[];
}

export default function ruleNaming(tokens: ParsedToken[], options?: RuleNamingOptions): string[] {
  const notices: string[] = [];

  if (!options?.format) {
    return notices;
  }

  const basicFormatter = {
    'kebab-case': kebabCase,
    camelCase,
    PascalCase: pascalCase,
    snake_case: snakeCase,
    SCREAMING_SNAKE_CASE: (name: string) => snakeCase(name).toLocaleUpperCase(),
  }[String(options.format)];

  for (const t of tokens) {
    if (basicFormatter) {
      const parts = t.id.split('.');
      if (!parts.every((part) => basicFormatter(part) === part)) {
        notices.push(`Token ${t.id}: not in ${options.format}`);
      }
    } else if (typeof options.format === 'function') {
      const result = options.format(t.id);
      if (result) {
        notices.push(`Token ${t.id}: ${result}`);
      }
    }
  }

  return notices;
}
