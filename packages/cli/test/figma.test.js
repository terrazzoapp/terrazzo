import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';
import {describe, expect, it, vi} from 'vitest';
import FIGMA_VARIABLE_API_RESPONSE from './fixtures/figma-success/api_v1_response.json';

const FILE_KEY = 'OkPWSU0cusQTumCNno7dm8';

// note: running execa like in the other tests doesn’t let us mock the fetch() call with msw.
// so we mock the CLI variables first, then load the JS module in the text scope

describe('Figma import', () => {
  it('parses valid syntax correctly', async () => {
    const cwd = new URL('./fixtures/figma-success/', import.meta.url);
    const server = setupServer(http.get(`https://api.figma.com/v1/files/${FILE_KEY}/variables/local`, () => HttpResponse.json(FIGMA_VARIABLE_API_RESPONSE)));
    server.listen();

    // run CLI
    process.argv = ['node', 'bin/cli.js', 'build', '--config', fileURLToPath(new URL('./tokens.config.js', cwd))];
    process.exit = vi.fn();
    const mod = await import('../bin/cli.js');
    await mod.default();

    expect(fs.readFileSync(new URL('./given.json', cwd), 'utf8')).toMatchFileSnapshot(fileURLToPath(new URL('./want.json', cwd)));

    // clean up
    server.close();
  });

  it('throws errors on invalid response', async () => {
    const cwd = new URL('./fixtures/figma-error/', import.meta.url);
    const server = setupServer(http.get(`https://api.figma.com/v1/files/${FILE_KEY}/variables/local`, () => HttpResponse.json({status: 401, error: true}, {status: 401})));
    server.listen();

    // run CLI
    process.argv = ['node', 'bin/cli.js', 'build', '--config', fileURLToPath(new URL('./tokens.config.js', cwd))];
    process.exit = vi.fn();
    const mod = await import('../bin/cli.js');
    await mod.default();

    expect(process.exit).toHaveBeenCalledWith(1);

    // clean up
    server.close();
  });
});
