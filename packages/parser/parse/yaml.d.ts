import type { DocumentNode } from '@humanwhocodes/momoa';
import type Logger from '../logger.js';

export interface ParseYAMLOptions {
  logger: Logger;
}

/**
 * Take a YAML document and create a Momoa JSON AST from it
 */
export default function yamlToAST(input: string, options: ParseYAMLOptions): DocumentNode;
