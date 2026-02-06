import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Logger } from '@terrazzo/parser';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { importCmd } from '../src/index.js';

vi.stubEnv('FIGMA_ACCESS_TOKEN', 'fig_fake_token');

const originalFetch = globalThis.fetch;

describe('import', () => {
  describe('figma', async () => {
    const cwd = new URL('./fixtures/import-figma/', import.meta.url);

    const FILE_KEY = 'AaAaAaAaAaAaAaAaAa';
    const FIGMA_GET_FILE_NODES = await fs.readFile(new URL('get-file-nodes.json', cwd), 'utf8');
    const FIGMA_GET_LOCAL_VARIABLES = await fs.readFile(new URL('get-local-variables.json', cwd), 'utf8');
    const FIGMA_GET_PUBLISHED_VARIABLES = await fs.readFile(new URL('get-published-variables.json', cwd), 'utf8');
    const FIGMA_GET_STYLES = await fs.readFile(new URL('get-styles.json', cwd), 'utf8');

    beforeEach(() => {
      globalThis.fetch = vi.fn().mockImplementation((url: string) => {
        return Promise.resolve(
          new Response(
            {
              [`https://api.figma.com/v1/files/${FILE_KEY}/nodes`]: FIGMA_GET_FILE_NODES,
              [`https://api.figma.com/v1/files/${FILE_KEY}/styles`]: FIGMA_GET_STYLES,
              [`https://api.figma.com/v1/files/${FILE_KEY}/variables/local`]: FIGMA_GET_LOCAL_VARIABLES,
              [`https://api.figma.com/v1/files/${FILE_KEY}/variables/published`]: FIGMA_GET_PUBLISHED_VARIABLES,
            }[url.replace(/\?.*$/, '')],
          ),
        );
      });
    });

    afterAll(() => {
      globalThis.fetch = originalFetch;
    });

    it('both', async () => {
      await importCmd({
        logger: new Logger(),
        positionals: ['import', `https://www.figma.com/design/${FILE_KEY}/My-File?node-id=1:1`],
        flags: { output: 'test/fixtures/import-figma/import-both.actual.json' },
      });
      await expect(await fs.readFile(new URL('import-both.actual.json', cwd), 'utf8')).toMatchFileSnapshot(
        fileURLToPath(new URL('import-both.want.json', cwd)),
      );
    });

    it('styles only', async () => {
      await importCmd({
        logger: new Logger(),
        positionals: ['import', `https://www.figma.com/design/${FILE_KEY}/My-File?node-id=1:1`],
        flags: { output: 'test/fixtures/import-figma/import-styles.actual.json', 'skip-variables': true },
      });
      await expect(await fs.readFile(new URL('import-styles.actual.json', cwd), 'utf8')).toMatchFileSnapshot(
        fileURLToPath(new URL('import-styles.want.json', cwd)),
      );
    });

    it('variables only', async () => {
      await importCmd({
        logger: new Logger(),
        positionals: ['import', `https://www.figma.com/design/${FILE_KEY}/My-File?node-id=1:1`],
        flags: { output: 'test/fixtures/import-figma/import-variables.actual.json', 'skip-styles': true },
      });
      await expect(await fs.readFile(new URL('import-variables.actual.json', cwd), 'utf8')).toMatchFileSnapshot(
        fileURLToPath(new URL('import-variables.want.json', cwd)),
      );
    });
  });
});
