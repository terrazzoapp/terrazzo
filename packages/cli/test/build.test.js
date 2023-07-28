import {execa} from 'execa';
import {describe, expect, it} from 'vitest';

const cmd = '../../../bin/cli.js';

describe('co build', () => {
  it('default', async () => {
    const cwd = new URL('./fixtures/build-default/', import.meta.url);
    await execa('node', [cmd, 'build'], {cwd});

    const builtTokens = await import('./fixtures/build-default/tokens/index.js');

    // rough token count
    expect(Object.keys(builtTokens.meta).length).toBe(34);
  });

  it('yaml', async () => {
    const cwd = new URL('./fixtures/build-yaml/', import.meta.url);
    await execa('node', [cmd, 'build'], {cwd});

    const builtTokens = await import('./fixtures/build-yaml/tokens/index.js');

    // rough token count
    expect(Object.keys(builtTokens.meta).length).toBe(34);
  });

  it('multiple', async () => {
    const cwd = new URL('./fixtures/build-multiple/', import.meta.url);
    await execa('node', [cmd, 'build'], {cwd});

    const builtTokens = await import('./fixtures/build-multiple/tokens/index.js');

    // rough token count
    expect(Object.keys(builtTokens.meta).length).toBe(66);

    // test 2: assert "color.black" in "typography.json" took priority
    expect(builtTokens.meta['color.black']._original).toEqual({
      $value: '#081f2f',
    });
  });
});
