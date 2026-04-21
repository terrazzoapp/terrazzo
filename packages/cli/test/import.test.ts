import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Logger } from '@terrazzo/parser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { importCmd } from '../src/index.js';

describe('import', () => {
  describe('figma', async () => {
    const cwd = new URL('./fixtures/import-figma/', import.meta.url);

    const FILE_KEY = 'AaAaAaAaAaAaAaAaAa';
    const FIGMA_GET_FILE_NODES = await fs.readFile(new URL('get-file-nodes.json', cwd), 'utf8');
    const FIGMA_GET_LOCAL_VARIABLES = await fs.readFile(new URL('get-local-variables.json', cwd), 'utf8');
    const FIGMA_GET_PUBLISHED_VARIABLES = await fs.readFile(new URL('get-published-variables.json', cwd), 'utf8');
    const FIGMA_GET_STYLES = await fs.readFile(new URL('get-styles.json', cwd), 'utf8');

    beforeEach(() => {
      vi.stubEnv('FIGMA_ACCESS_TOKEN', 'fig_fake_token');
      vi.stubEnv('FIGMA_OAUTH_TOKEN', '');

      vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
        return Promise.resolve(
          new Response(
            {
              [`https://api.figma.com/v1/files/${FILE_KEY}/nodes`]: FIGMA_GET_FILE_NODES,
              [`https://api.figma.com/v1/files/${FILE_KEY}/styles`]: FIGMA_GET_STYLES,
              [`https://api.figma.com/v1/files/${FILE_KEY}/variables/local`]: FIGMA_GET_LOCAL_VARIABLES,
              [`https://api.figma.com/v1/files/${FILE_KEY}/variables/published`]: FIGMA_GET_PUBLISHED_VARIABLES,
            }[url.toString().replace(/\?.*$/, '')],
          ),
        );
      });
    });

    afterEach(() => {
      vi.unstubAllEnvs();
      vi.restoreAllMocks();
    });

    it('default', async () => {
      await importCmd({
        logger: new Logger(),
        positionals: ['import', `https://www.figma.com/design/${FILE_KEY}/My-File?node-id=1:1`],
        flags: { output: 'test/fixtures/import-figma/import-default.actual.json' },
      });
      const actual = new URL('import-default.actual.json', cwd);
      const actualSrc = await fs.readFile(actual, 'utf8');
      await expect(actualSrc).toMatchFileSnapshot(fileURLToPath(new URL('import-default.want.json', cwd)));

      // Note: previously we’d validate the Resolver, however, with our current example, there are connection errors
      // so we get unresolvable aliases
    });

    it('--skip-variables', async () => {
      await importCmd({
        logger: new Logger(),
        positionals: ['import', `https://www.figma.com/design/${FILE_KEY}/My-File?node-id=1:1`],
        flags: { output: 'test/fixtures/import-figma/import-styles.actual.json', 'skip-variables': true },
      });
      await expect(await fs.readFile(new URL('import-styles.actual.json', cwd), 'utf8')).toMatchFileSnapshot(
        fileURLToPath(new URL('import-styles.want.json', cwd)),
      );
    });

    it('--skip-styles', async () => {
      await importCmd({
        logger: new Logger(),
        positionals: ['import', `https://www.figma.com/design/${FILE_KEY}/My-File?node-id=1:1`],
        flags: { output: 'test/fixtures/import-figma/import-variables.actual.json', 'skip-styles': true },
      });
      await expect(await fs.readFile(new URL('import-variables.actual.json', cwd), 'utf8')).toMatchFileSnapshot(
        fileURLToPath(new URL('import-variables.want.json', cwd)),
      );
    });

    it('--unpublished', async () => {
      // This should contain legacy/* variables that the previous snapshots did not
      await importCmd({
        logger: new Logger(),
        positionals: ['import', `https://www.figma.com/design/${FILE_KEY}/My-File?node-id=1:1`],
        flags: { output: 'test/fixtures/import-figma/import-unpublished.actual.json', unpublished: true },
      });
      await expect(await fs.readFile(new URL('import-unpublished.actual.json', cwd), 'utf8')).toMatchFileSnapshot(
        fileURLToPath(new URL('import-unpublished.want.json', cwd)),
      );
    });

    it('--font-family-names, --font-weight-names, --number-names', async () => {
      // This should contain legacy/* variables that the previous snapshots did not
      await importCmd({
        logger: new Logger(),
        positionals: ['import', `https://www.figma.com/design/${FILE_KEY}/My-File?node-id=1:1`],
        flags: {
          output: 'test/fixtures/import-figma/import-name-matchers.actual.json',
          'font-family-names': 'fontStack',
          'font-weight-names': 'weight',
          'number-names': 'foobar',
        },
      });
      await expect(await fs.readFile(new URL('import-name-matchers.actual.json', cwd), 'utf8')).toMatchFileSnapshot(
        fileURLToPath(new URL('import-name-matchers.want.json', cwd)),
      );
    });

    describe('auth headers', () => {
      const positionals = ['import', `https://www.figma.com/design/${FILE_KEY}/My-File?node-id=1:1`];
      const flags = { output: 'test/fixtures/import-figma/import-default.actual.json' };

      it('PAT: sends X-Figma-Token', async () => {
        vi.stubEnv('FIGMA_ACCESS_TOKEN', 'fig_fake_token');
        vi.stubEnv('FIGMA_OAUTH_TOKEN', '');
        await importCmd({ logger: new Logger(), positionals, flags });
        expect(globalThis.fetch).toHaveBeenCalledWith(expect.any(String), {
          method: 'GET',
          headers: { 'X-Figma-Token': 'fig_fake_token' },
        });
      });

      it('OAuth: sends Authorization: Bearer', async () => {
        vi.stubEnv('FIGMA_ACCESS_TOKEN', '');
        vi.stubEnv('FIGMA_OAUTH_TOKEN', 'fig_fake_oauth_token');
        await importCmd({ logger: new Logger(), positionals, flags });
        expect(globalThis.fetch).toHaveBeenCalledWith(expect.any(String), {
          method: 'GET',
          headers: { Authorization: 'Bearer fig_fake_oauth_token' },
        });
      });

      it('precedence: OAuth wins when both tokens are set', async () => {
        vi.stubEnv('FIGMA_ACCESS_TOKEN', 'fig_pat_token');
        vi.stubEnv('FIGMA_OAUTH_TOKEN', 'fig_oauth_token');
        await importCmd({ logger: new Logger(), positionals, flags });
        expect(globalThis.fetch).toHaveBeenCalledWith(expect.any(String), {
          method: 'GET',
          headers: { Authorization: 'Bearer fig_oauth_token' },
        });
      });
    });
  });
});
