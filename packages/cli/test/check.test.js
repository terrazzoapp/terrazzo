import { expect } from 'chai';
import { execSync } from 'child_process';

const cmd = 'node ../../../bin/cli.js';

describe('co check', () => {
  it('default filename', () => {
    const cwd = new URL('./fixtures/check-default/', import.meta.url);
    expect(() => execSync(`${cmd} check`, { cwd })).to.not.throw();
  });

  it('custom filename', () => {
    const cwd = new URL('./fixtures/check-custom/', import.meta.url);
    expect(() => execSync(`${cmd} check tokens-2.json`, { cwd })).to.not.throw();
  });

  it('invalid tokens', () => {
    const cwd = new URL('./fixtures/check-invalid/', import.meta.url);
    expect(() => execSync(`${cmd} check`, { cwd })).to.throw();
  });
});
