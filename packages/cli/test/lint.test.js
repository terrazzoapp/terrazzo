import { execa } from 'execa';
import { describe, expect, it } from 'vitest';

const cmd = '../../../bin/cli.js';

describe('lint', () => {
  describe('general', () => {
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
  });
});
