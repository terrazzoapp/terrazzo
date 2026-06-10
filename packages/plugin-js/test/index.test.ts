import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execaNode } from 'execa';
import { describe, expect, it } from 'vitest';

describe('@terrazzo/plugin-js', () => {
  describe('CLI', () => {
    it.each([
      'adobe-spectrum',
      // 'apple-hig',
      'figma-sds',
      'github-primer',
      'ibm-carbon',
      'microsoft-fluent',
      'shopify-polaris',
    ])('%s', async (ds) => {
      const cwd = new URL(`./fixtures/${ds}/`, import.meta.url);
      await execaNode({ cwd })`../../../../cli/bin/cli.js build`;

      await expect(await fs.readFile(new URL('actual.d.ts', cwd), 'utf8'), '.d.ts mismatch!').toMatchFileSnapshot(
        fileURLToPath(new URL('want.d.ts', cwd)),
      );
      await expect(await fs.readFile(new URL('actual.js', cwd), 'utf8'), '.js mismatch!').toMatchFileSnapshot(
        fileURLToPath(new URL('want.js', cwd)),
      );
    }, 120_000); // Note: GitHub has 12 permutations, which take ~5 seconds each  Allow more time for CI.

    it('generates declarations that type-check without @terrazzo/parser in a consumer project', async () => {
      const cwd = new URL('./fixtures/shopify-polaris/', import.meta.url);
      await execaNode({ cwd })`../../../../cli/bin/cli.js build`;

      const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'terrazzo-plugin-js-consumer-'));
      try {
        const tokenPackageDir = path.join(tmp, 'node_modules/@example/tokens');
        const tokenTypesDir = path.join(tmp, 'node_modules/@terrazzo/token-types');
        await fs.mkdir(tokenPackageDir, { recursive: true });
        await fs.mkdir(tokenTypesDir, { recursive: true });
        await fs.copyFile(new URL('actual.js', cwd), path.join(tokenPackageDir, 'index.js'));
        await fs.copyFile(new URL('actual.d.ts', cwd), path.join(tokenPackageDir, 'index.d.ts'));
        await fs.copyFile(
          new URL('../../token-types/dist/index.d.ts', import.meta.url),
          path.join(tokenTypesDir, 'index.d.ts'),
        );
        await fs.writeFile(
          path.join(tokenPackageDir, 'package.json'),
          JSON.stringify({
            name: '@example/tokens',
            version: '0.0.0',
            type: 'module',
            exports: {
              '.': {
                types: './index.d.ts',
                default: './index.js',
              },
            },
          }),
        );
        await fs.writeFile(
          path.join(tokenTypesDir, 'package.json'),
          JSON.stringify({
            name: '@terrazzo/token-types',
            version: '0.0.0',
            type: 'module',
            exports: {
              '.': {
                types: './index.d.ts',
                default: './index.js',
              },
            },
          }),
        );
        await fs.writeFile(path.join(tokenTypesDir, 'index.js'), '');
        await fs.writeFile(
          path.join(tmp, 'package.json'),
          JSON.stringify({
            type: 'module',
            dependencies: {
              '@terrazzo/token-types': '0.0.0',
              '@example/tokens': '0.0.0',
            },
            devDependencies: {
              typescript: '*',
            },
          }),
        );
        await fs.writeFile(
          path.join(tmp, 'index.ts'),
          `import { resolver, type Color } from '@example/tokens';

const tokens = resolver.apply({});
const color: Color = tokens["color.black"];
color.$value.components satisfies (number | null)[];
`,
        );
        await fs.writeFile(
          path.join(tmp, 'tsconfig.json'),
          JSON.stringify({
            compilerOptions: {
              module: 'ESNext',
              moduleResolution: 'Bundler',
              noEmit: true,
              strict: true,
              target: 'ESNext',
            },
            include: ['index.ts'],
          }),
        );

        const tsc = fileURLToPath(new URL('../../../node_modules/typescript/bin/tsc', import.meta.url));
        await execaNode(tsc, ['-p', tmp]);
      } finally {
        await fs.rm(tmp, { recursive: true, force: true });
      }
    });
  });

  describe('runtime', () => {
    it.each([
      { theme: 'light', size: 'default' },
      { theme: 'light-hc', size: 'default' },
      { theme: 'dark', size: 'default' },
      { theme: 'dark-hc', size: 'default' },
      { theme: 'light', size: 'coarse' },
      { theme: 'light-hc', size: 'coarse' },
      { theme: 'dark', size: 'coarse' },
      { theme: 'dark-hc', size: 'coarse' },
      { theme: 'light', size: 'fine' },
      { theme: 'light-hc', size: 'fine' },
      { theme: 'dark', size: 'fine' },
      { theme: 'dark-hc', size: 'fine' },
    ] as const)('$theme/$size', async (input) => {
      const { resolver } = await import('./fixtures/github-primer/want.js');
      const tokens = resolver.apply(input);
      for (const id of Object.keys(tokens)) {
        expect({
          $type: tokens[id as keyof typeof tokens]!.$type,
          $value: tokens[id as keyof typeof tokens]!.$value,
        }).toMatchSnapshot(id);
      }
    });
  });
});
