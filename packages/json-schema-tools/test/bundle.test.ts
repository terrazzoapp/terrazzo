import fs from 'node:fs/promises';
import * as momoa from '@humanwhocodes/momoa';
import { describe, expect, it } from 'vitest';
import { bundle } from '../src/index.js';

describe('bundle', () => {
  it('single entry', async () => {
    const filename = new URL('./fixtures/single-entry/root.json', import.meta.url);
    const sources = [{ src: await fs.readFile(filename, 'utf8'), filename }];
    const { document } = await bundle(sources, {
      async req(url) {
        return await fs.readFile(url, 'utf8');
      },
    });
    expect(momoa.print(document, { indent: 2 })).toMatchInlineSnapshot(`
      "{
        "root": {
          "type": "object",
          "properties": {
            "$ref": "#\\/$defs\\/.\\/properties\\/a.json",
            "c": {
              "$ref": "#\\/$defs\\/.\\/properties\\/nested\\/c.json"
            }
          }
        },
        "$defs": {
          ".\\/properties\\/a.json": {
            "$ref": "#\\/$defs\\/.\\/properties\\/b.json",
            "a": {
              "type": "string"
            }
          },
          ".\\/properties\\/nested\\/c.json": {
            "description": {
              "$ref": "#\\/$defs\\/.\\/_desc.json"
            },
            "type": "number"
          },
          ".\\/properties\\/b.json": {
            "type": "boolean"
          },
          ".\\/_desc.json": "Generic description"
        }
      }"
    `);
  });
});
