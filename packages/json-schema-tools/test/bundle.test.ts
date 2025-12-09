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
            "$ref": "#\\/$defs\\/file:.\\/properties\\/b.json",
            "c": {
              "$ref": "#\\/$defs\\/file:.\\/properties\\/nested\\/c.json"
            }
          },
          "$defs": {
            "file:.\\/properties\\/a.json": {
              "$ref": "#\\/$defs\\/file:.\\properties\\/b.json",
              "a": {
                "type": "string"
              }
            },
            "file:.\\/properties\\/b.json": {
              "type": "boolean"
            },
            "file:.\\/properties\\nested\\/c.json": {
              "description": {
                "$ref": "#\\/$defs\\/file:.\\/_desc.json"
              },
              "type": "number"
            },
            "file:.\\/_desc.json": "Generic description"
          }
        }
      }"
    `);
  });
});
