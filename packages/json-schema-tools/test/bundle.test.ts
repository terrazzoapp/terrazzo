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
    expect(momoa.print(document, { indent: 2 }).replace(/\\\//g, '/')).toMatchInlineSnapshot(`
      "{
        "root": {
          "type": "object",
          "properties": {
            "$ref": "#/$defs/.~1properties~1a.json",
            "c": {
              "$ref": "#/$defs/.~1properties~1nested~1c.json"
            },
            "partial": {
              "$ref": "#/$defs/.~1properties~1partial.json/deeply/nested/value"
            }
          }
        },
        "$defs": {
          ".~1properties~1a.json": {
            "$ref": "#/$defs/.~1properties~1b.json",
            "a": {
              "type": "string"
            }
          },
          ".~1properties~1nested~1c.json": {
            "description": {
              "$ref": "#/$defs/.~1_desc.json"
            },
            "type": "number"
          },
          ".~1properties~1partial.json": {
            "deeply": {
              "nested": {
                "value": true
              }
            }
          },
          ".~1properties~1b.json": {
            "type": "boolean"
          },
          ".~1_desc.json": "Generic description"
        }
      }"
    `);
  });

  it('multiple', async () => {
    const sources = [
      { filename: new URL('file:///a.json'), src: '{"a":"a"}' },
      { filename: new URL('file:///b.json'), src: '{"b":"b"}' },
      { filename: new URL('file:///c.json'), src: '{"c":"c"}' },
    ];
    const { document } = await bundle(sources, {
      async req() {
        return '';
      },
    });
    expect(momoa.print(document, { indent: 2 })).toMatchInlineSnapshot(`
      "{
        "a": "a",
        "b": "b",
        "c": "c"
      }"
    `);
  });
});
