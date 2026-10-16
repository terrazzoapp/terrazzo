import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { build, defineConfig, parse } from '@terrazzo/parser';
import { describe, expect, it } from 'vitest';

import android, { type AndroidPluginOptions, toPropertyName } from '../src/index.js';

async function run(dir: string, options: AndroidPluginOptions) {
  const cwd = new URL(`./${dir}/`, import.meta.url);
  const config = defineConfig({ outDir: dir, plugins: [android(options)] }, { cwd });
  const tokensJSON = new URL('./tokens.json', cwd);
  const { tokens, resolver, sources } = await parse(
    [{ filename: tokensJSON, src: fs.readFileSync(tokensJSON, 'utf8') }],
    { config },
  );
  const result = await build(tokens, { config, resolver, sources });
  return { cwd, result };
}

describe('@terrazzo/plugin-android', () => {
  it('color, with light and dark modes', async () => {
    const { cwd, result } = await run('color', {
      packageName: 'com.example.tokens',
      objectName: 'Want',
    });
    expect(result.outputFiles.map((f) => f.filename)).toEqual(['Want.kt']);
    for (const { filename, contents } of result.outputFiles) {
      // oxlint-disable-next-line no-await-in-loop
      await expect(contents).toMatchFileSnapshot(fileURLToPath(new URL(filename, cwd)));
    }
  });

  it('single mode', async () => {
    const { cwd, result } = await run('single-mode', { objectName: 'Want' });
    const [file] = result.outputFiles;
    expect(file!.contents).not.toContain('WantDark');
    expect(file!.contents).not.toContain('package ');
    await expect(file!.contents).toMatchFileSnapshot(fileURLToPath(new URL(file!.filename, cwd)));
  });

  it('toPropertyName', () => {
    expect(toPropertyName('color.primitive.blue.1')).toBe('colorPrimitiveBlue1');
    expect(toPropertyName('color.bg-subtle')).toBe('colorBgSubtle');
    expect(toPropertyName('Color.Text')).toBe('colorText');
    expect(toPropertyName('100.red')).toBe('_100Red');
    expect(toPropertyName('in')).toBe('`in`');
  });

  it('errors on names that collide', async () => {
    const cwd = new URL('./single-mode/', import.meta.url);
    const config = defineConfig({ outDir: 'single-mode', plugins: [android()] }, { cwd });
    const src = JSON.stringify({
      color: {
        $type: 'color',
        'bg-1': { $value: { colorSpace: 'srgb', components: [1, 1, 1] } },
        bg1: { $value: { colorSpace: 'srgb', components: [0, 0, 0] } },
      },
    });
    const { tokens, resolver, sources } = await parse(
      [{ filename: new URL('file:///collide.json'), src }],
      {
        config,
      },
    );
    await expect(build(tokens, { config, resolver, sources })).rejects.toThrow(
      'Tokens color.bg-1 and color.bg1 both map to the Kotlin property colorBg1',
    );
  });
});
