import type { SourceLocation } from '@babel/code-frame';
import type { DocumentNode } from '@humanwhocodes/momoa';
import { Composer, Parser, type YAMLError } from 'yaml';
import type Logger from '../logger.js';

export interface ParseYAMLOptions {
  logger: Logger;
}

/** Convert YAML position to line, column */
function posToLoc(input: string, pos: YAMLError['pos']): SourceLocation['start'] {
  let line = 1;
  let column = 0;
  for (let i = 0; i <= (pos[0] || 0); i++) {
    const c = input[i];
    if (c === '\n') {
      line++;
      column = 0;
    }
    column++;
  }
  return { line, column };
}

/**
 * Take a YAML document and create a Momoa JSON AST from it
 */
export default function yamlToAST(input: string, { logger }: ParseYAMLOptions): DocumentNode {
  const parser = new Parser();
  const composer = new Composer();
  for (const node of composer.compose(parser.parse(input))) {
    if (node.errors) {
      for (const error of node.errors) {
        logger.error({
          label: 'parse:yaml',
          message: `${error.code} ${error.message}`,
          code: input,
          loc: posToLoc(input, error.pos),
        });
      }
    }
  }
}
