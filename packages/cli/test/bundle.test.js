import {execa} from 'execa';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const cmd = '../../../bin/cli.js';

describe('co bundle', () => {
  it('JSON', async () => {
    const cwd = new URL('./fixtures/bundle-default/', import.meta.url);
    await execa('node', [cmd, 'bundle', '--out', 'given/bundled.json'], {cwd});
    expect(fs.readFileSync(new URL('./given/bundled.json', cwd), 'utf8')).toMatchFileSnapshot(fileURLToPath(new URL('./want/bundled.json', cwd)));
  });

  it('YAML', async () => {
    const cwd = new URL('./fixtures/bundle-default/', import.meta.url);
    await execa('node', [cmd, 'bundle', '--out', 'given/bundled.yaml'], {cwd});
    expect(fs.readFileSync(new URL('./given/bundled.yaml', cwd), 'utf8')).toMatchFileSnapshot(fileURLToPath(new URL('./want/bundled.yaml', cwd)));
  });
});
