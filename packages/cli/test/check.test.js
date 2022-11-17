import {execSync} from 'child_process';
import {URL} from 'node:url';
import {describe, expect, test} from 'vitest';

const cmd = 'node ../../../bin/cli.js';

describe('co check', () => {
  test('default filename', () => {
    const cwd = new URL('./fixtures/check-default/', import.meta.url);
    expect(() => execSync(`${cmd} check`, {cwd})).to.not.throw();
  });

  test('custom filename', () => {
    const cwd = new URL('./fixtures/check-custom/', import.meta.url);
    expect(() => execSync(`${cmd} check tokens-2.json`, {cwd})).to.not.throw();
  });

  test('invalid tokens', () => {
    const cwd = new URL('./fixtures/check-invalid/', import.meta.url);
    expect(() => execSync(`${cmd} check`, {cwd})).to.throw();
  });
});
