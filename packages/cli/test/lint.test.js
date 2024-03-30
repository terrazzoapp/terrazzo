import { execa } from 'execa';
import stripAnsi from 'strip-ansi';
import { describe, expect, it } from 'vitest';

const cmd = '../../../bin/cli.js';

describe('lint', () => {
  it('can lint current directory', async () => {
    const cwd = new URL('./fixtures/lint-passing/', import.meta.url);
    const { stdout } = await execa('node', [cmd, 'lint'], { cwd });
    expect(stdout).toContain('all checks passed');
  });

  it('can lint manual path (while loading config)', async () => {
    const cwd = new URL('./fixtures/lint-manual-path/', import.meta.url);
    const { stdout } = await execa('node', [cmd, 'lint', '../../../../../examples/radix/tokens.yaml'], { cwd });
    expect(stdout).toContain('all checks passed');
  });

  it('throws syntax error', async () => {
    const cwd = new URL('./fixtures/lint-invalid-syntax/', import.meta.url);
    expect(() => execa('node', [cmd, 'lint'], { cwd })).rejects.toThrowError(
      '[config] lint rule "a11y/contrast" invalid syntax. Expected string | number | array, received object',
    );
  });

  it('builtin rules', async () => {
    const cwd = new URL('./fixtures/lint-builtin-rules/', import.meta.url);
    try {
      await execa('node', [cmd, 'lint'], { cwd });
      throw new Error(`Expected to throw`);
    } catch (err) {
      expect(stripAnsi(err.message)).toMatch(`  ✘  required-children: ERROR
    Match 0: some groups missing required token "300"
  !  duplicate-values: WARNING
    Duplicated value: "#3c3c43" (color.blue.200)`);
    }
  });
});
