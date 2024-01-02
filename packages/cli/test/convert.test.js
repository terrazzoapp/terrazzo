import {execa} from 'execa';
import fs from 'node:fs';
import {URL, fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const cmd = '../../../bin/cli.js';

describe('convert', () => {
  it('converts Style Dictionary → DTCG', async () => {
    const cwd = new URL('./fixtures/style-dictionary/', import.meta.url);
    await execa('node', [cmd, 'convert', 'tokens.json', '-o', 'given.json'], {cwd});
    expect(fs.readFileSync(new URL('given.json', cwd), 'utf8')).toMatchFileSnapshot(fileURLToPath(new URL('want.json', cwd)));
  });
});
