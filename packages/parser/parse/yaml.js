import { Composer, Parser } from 'yaml';

/**
 * @typedef {import("yaml").YAMLError} YAMLError
 */

/**
 * Convert YAML position to line, column
 * @param {string} input
 * @param {YAMLError{"pos"]} pos
 * @return {import("@babel/code-frame").SourceLocation["start"]}
 */
function posToLoc(input, pos) {
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
export default function yamlToAST(input, { logger }) {
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
