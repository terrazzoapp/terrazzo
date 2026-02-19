import stripAnsi from 'strip-ansi';
import { describe, expect, it } from 'vitest';
import { build, defineConfig, parse } from '../src/index.js';

describe('Plugin API', () => {
  it('name', async () => {
    try {
      const config = defineConfig({ plugins: [{} as any] }, { cwd: new URL('file:///') });
      expect(config).toThrow();
    } catch (err) {
      expect(stripAnsi((err as Error).message)).toMatchInlineSnapshot(`"config:plugin[0]: Missing "name""`);
    }
  });

  describe('getTransforms / setTransforms', () => {
    it('can’t setTransform for missing token', async () => {
      const config = defineConfig(
        {
          plugins: [
            {
              name: 'my-plugin',
              async transform({ setTransform }) {
                setTransform('my.toker', { format: 'my-format', value: 'foo' });
              },
            },
          ],
        },
        { cwd: new URL('file:///') },
      );
      const { sources, tokens, resolver } = await parse(
        [{ src: { my: { token: { $type: 'number', $value: 10 } } }, filename: new URL('file:///') }],
        { config },
      );
      try {
        const result = await build(tokens, { config, resolver, sources });
        expect(result).toThrow();
      } catch (err) {
        expect(stripAnsi((err as Error).message)).toBe('plugin:my-plugin: No token "my.toker"');
      }
    });

    it('simple transform', async () => {
      const config = defineConfig(
        {
          plugins: [
            {
              name: 'my-plugin',
              async transform({ setTransform }) {
                setTransform('my.token', { format: 'my-format', value: 'foo' });
              },
              async build({ getTransforms, outputFile }) {
                outputFile(String(getTransforms({ id: 'my.token', format: 'my-format' })?.[0]?.value), 'file.txt');
              },
            },
          ],
        },
        { cwd: new URL('file:///') },
      );
      const { sources, tokens, resolver } = await parse(
        [{ src: { my: { token: { $type: 'number', $value: 10 } } }, filename: new URL('file:///') }],
        { config },
      );
      const { outputFiles } = await build(tokens, { config, resolver, sources });
      expect(outputFiles[0]).toEqual(
        expect.objectContaining({ contents: 'file.txt', filename: 'foo', plugin: 'my-plugin' }),
      );
    });

    it('input transform', async () => {
      const config = defineConfig(
        {
          plugins: [
            {
              name: 'my-plugin',
              async transform({ setTransform }) {
                setTransform('my.token', { format: 'my-format', value: 'foo', input: {} });
              },
              async build({ getTransforms, outputFile }) {
                outputFile(
                  String(getTransforms({ id: 'my.token', format: 'my-format', input: {} }).map((t) => t.value)),
                  'file.txt',
                );
              },
            },
          ],
        },
        { cwd: new URL('file:///') },
      );
      const { sources, tokens, resolver } = await parse(
        [{ src: { my: { token: { $type: 'number', $value: 10 } } }, filename: new URL('file:///') }],
        { config },
      );
      const { outputFiles } = await build(tokens, { config, resolver, sources });
      expect(outputFiles[0]).toEqual(
        expect.objectContaining({ contents: 'file.txt', filename: 'foo', plugin: 'my-plugin' }),
      );
    });

    it('default mode transform', async () => {
      const config = defineConfig(
        {
          plugins: [
            {
              name: 'my-plugin',
              async transform({ setTransform }) {
                setTransform('my.token', { format: 'my-format', value: 'foo', mode: '.' });
              },
              async build({ getTransforms, outputFile }) {
                outputFile(
                  'file.txt',
                  String(getTransforms({ id: 'my.token', format: 'my-format', mode: '.' }).map((t) => t.value)),
                );
              },
            },
          ],
        },
        { cwd: new URL('file:///') },
      );
      const { sources, tokens, resolver } = await parse(
        [{ src: { my: { token: { $type: 'number', $value: 10 } } }, filename: new URL('file:///') }],
        { config },
      );
      const { outputFiles } = await build(tokens, { config, resolver, sources });
      expect(outputFiles[0]).toEqual(
        expect.objectContaining({ filename: 'file.txt', contents: 'foo', plugin: 'my-plugin' }),
      );
    });

    it('multi-mode transform', async () => {
      const config = defineConfig(
        {
          plugins: [
            {
              name: 'my-plugin',
              async transform({ setTransform }) {
                setTransform('my.token', { format: 'my-format', value: 'foo', mode: '.' });
                setTransform('my.token', { format: 'my-format', value: 'foo-light', mode: 'light' });
                setTransform('my.token', { format: 'my-format', value: 'foo-dark', mode: 'dark' });
              },
              async build({ getTransforms, outputFile }) {
                outputFile(
                  'all.txt',
                  String(getTransforms({ id: 'my.token', format: 'my-format', mode: '*' }).map((t) => t.value)),
                );
                outputFile(
                  'default.txt',
                  String(getTransforms({ id: 'my.token', format: 'my-format', mode: '.' }).map((t) => t.value)),
                );
                outputFile(
                  'light.txt',
                  String(getTransforms({ id: 'my.token', format: 'my-format', mode: 'light' }).map((t) => t.value)),
                );
                outputFile(
                  'dark.txt',
                  String(getTransforms({ id: 'my.token', format: 'my-format', mode: 'dark' }).map((t) => t.value)),
                );
              },
            },
          ],
        },
        { cwd: new URL('file:///') },
      );
      const { sources, tokens, resolver } = await parse(
        [{ src: { my: { token: { $type: 'number', $value: 10 } } }, filename: new URL('file:///') }],
        { config },
      );
      const { outputFiles } = await build(tokens, { config, resolver, sources });
      expect(outputFiles.find((f) => f.filename === 'all.txt')).toEqual(
        expect.objectContaining({ contents: 'foo,foo-light,foo-dark', plugin: 'my-plugin' }),
      );
      expect(outputFiles.find((f) => f.filename === 'default.txt')).toEqual(
        expect.objectContaining({ contents: 'foo', plugin: 'my-plugin' }),
      );
      expect(outputFiles.find((f) => f.filename === 'light.txt')).toEqual(
        expect.objectContaining({ contents: 'foo-light', plugin: 'my-plugin' }),
      );
      expect(outputFiles.find((f) => f.filename === 'dark.txt')).toEqual(
        expect.objectContaining({ contents: 'foo-dark', plugin: 'my-plugin' }),
      );
    });

    it('upconverts modes to inputs', async () => {
      const config = defineConfig(
        {
          plugins: [
            {
              name: 'my-plugin',
              async transform({ setTransform }) {
                setTransform('my.token', { format: 'my-format', value: 'foo', mode: '.' });
                setTransform('my.token', { format: 'my-format', value: 'foo-light', mode: 'light' });
                setTransform('my.token', { format: 'my-format', value: 'foo-dark', mode: 'dark' });
              },
              async build({ getTransforms, outputFile }) {
                outputFile(
                  'default.txt',
                  String(
                    getTransforms({ id: 'my.token', format: 'my-format', input: { tzMode: '.' } }).map((t) => t.value),
                  ),
                );
                outputFile(
                  'light.txt',
                  String(
                    getTransforms({ id: 'my.token', format: 'my-format', input: { tzMode: 'light' } }).map(
                      (t) => t.value,
                    ),
                  ),
                );
                outputFile(
                  'dark.txt',
                  String(
                    getTransforms({ id: 'my.token', format: 'my-format', input: { tzMode: 'dark' } }).map(
                      (t) => t.value,
                    ),
                  ),
                );
              },
            },
          ],
        },
        { cwd: new URL('file:///') },
      );
      const { sources, tokens, resolver } = await parse(
        [{ src: { my: { token: { $type: 'number', $value: 10 } } }, filename: new URL('file:///') }],
        { config },
      );
      const { outputFiles } = await build(tokens, { config, resolver, sources });
      expect(outputFiles.find((f) => f.filename === 'default.txt')).toEqual(
        expect.objectContaining({ contents: 'foo', plugin: 'my-plugin' }),
      );
      expect(outputFiles.find((f) => f.filename === 'light.txt')).toEqual(
        expect.objectContaining({ contents: 'foo-light', plugin: 'my-plugin' }),
      );
      expect(outputFiles.find((f) => f.filename === 'dark.txt')).toEqual(
        expect.objectContaining({ contents: 'foo-dark', plugin: 'my-plugin' }),
      );
    });
  });
});
