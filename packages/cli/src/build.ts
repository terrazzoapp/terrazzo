import type { Config, ParseResult, Schema } from '@cobalt-ui/core';
import fs from 'fs';

export async function build(config: Config, schema: ParseResult['result'], rawSchema: Schema): Promise<void> {
  await Promise.all(
    config.plugins.map(async (plugin) => {
      try {
        // config()
        if (plugin.config) plugin.config(config);

        // build()
        const results = await plugin.build({ schema, rawSchema });
        if (!results) return;
        if (!Array.isArray(results) || !results.every((r) => r.fileName && r.contents)) {
          throw new Error(`[${plugin.name}] invalid build results`);
        }
        for (const { fileName, contents } of results) {
          const filePath = new URL(fileName.replace(/^\//, '').replace(/^(\.\.\/)+/, ''), config.outDir);
          fs.mkdirSync(new URL('./', filePath), { recursive: true });
          fs.writeFileSync(filePath, contents);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[${plugin.name}] ${err}`);
        throw err;
      }
    })
  );
}
