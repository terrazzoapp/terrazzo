import { defineConfig } from "@terrazzo/cli";
import { describe, expect, test } from 'vitest'
import js from '../src/index.js'

describe('@terrazzo/plugin-css', () => {
  test.each([])(
    '%s',
    async (dir) => {
      const cwd = new URL(`./${dir}/`, import.meta.url);
      const config = defineConfig({
        plugins: [js({
          js: 'actual.js',
          json: 'actual.json',
          ts: true,
        })]
      }, {cwd});
    })
  })
});
