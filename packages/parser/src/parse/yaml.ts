import type { DocumentNode } from '@humanwhocodes/momoa';
import { Composer, Parser } from 'yaml';
import type Logger from '../logger.js';

export interface ParseYAMLOptions {
  logger: Logger;
}

/**
 * Take a YAML document and create a Momoa JSON AST from it
 */
export default function yamlToAST(input: string, { logger }: ParseYAMLOptions): DocumentNode {
  const parser = new Parser();
  const composer = new Composer();
  for (const node of composer.compose(parser.parse(input))) {
    console.log({ node });
    if (node.errors) {
      for (const error of node.errors) {
        logger.error({
          label: 'parse:yaml',
          message: `${error.code} ${error.message}`,
          codeFrame: { code: input, line: error.pos[0], column: error.pos[1] },
        });
      }
    }
  }
}
