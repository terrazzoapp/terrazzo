import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import type { Plugin } from '@terrazzo/parser';
import { afterAll, describe, expect, it } from 'vitest';

const pkgRoot = path.resolve(import.meta.dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-swift-'));

afterAll(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe('colorjs.io instance mismatch', () => {
  it('converts colors when the plugin resolves its own colorjs.io copy', async () => {
    // Install the built plugin beside a private colorjs.io copy, as npm does for mismatched ranges
    fs.mkdirSync(path.join(tmp, 'node_modules/@terrazzo'), { recursive: true });
    fs.cpSync(
      path.join(pkgRoot, 'node_modules/colorjs.io'),
      path.join(tmp, 'node_modules/colorjs.io'),
      {
        recursive: true,
        dereference: true,
      },
    );
    fs.symlinkSync(
      fs.realpathSync(path.join(pkgRoot, 'node_modules/@terrazzo/token-tools')),
      path.join(tmp, 'node_modules/@terrazzo/token-tools'),
    );
    fs.writeFileSync(path.join(tmp, 'package.json'), '{"type":"module"}');
    const dist = fs.readFileSync(path.join(pkgRoot, 'dist/index.js'), 'utf8');
    fs.writeFileSync(path.join(tmp, 'index.js'), dist.replace(/\/\/# sourceMappingURL=.*/, ''));

    const { default: swift } = (await import(pathToFileURL(path.join(tmp, 'index.js')).href)) as {
      default: () => Plugin;
    };
    const transforms: unknown[] = [];
    await swift().transform?.({
      tokens: {
        red: {
          id: 'red',
          $type: 'color',
          mode: { '.': { $value: { colorSpace: 'srgb', components: [1, 0, 0], alpha: 1 } } },
        },
      },
      setTransform: (_id: string, value: unknown) => transforms.push(value),
    } as never);

    expect(transforms).toHaveLength(1);
  });
});
