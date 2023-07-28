#!/usr/bin/env node

import fs from 'node:fs';

// settings
const LB_RE = /\n/g;
const license = fs
  .readFileSync(new URL('../LICENSE', import.meta.url), 'utf8')
  .trim()
  .replace(LB_RE, '\n * ');

// run
const cwd = new URL(`file://${process.cwd()}/`);
const [, , module, targets] = process.argv;

for (const target of targets.split(',')) {
  const filepath = new URL(target, cwd);
  const contents = fs.readFileSync(filepath, 'utf8');

  fs.writeFileSync(
    filepath,
    `/**
 * @module ${module}
 * @license ${license}
 */
${contents}`,
  );
}
