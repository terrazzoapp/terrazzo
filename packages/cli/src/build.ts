import type {ParseResult, ResolvedConfig, Group} from '@cobalt-ui/core';
import co from '@cobalt-ui/core';
import fs from 'node:fs';
import {URL} from 'node:url';

export default async function build(rawSchema: Group, config: ResolvedConfig): Promise<ParseResult> {
  const {errors, warnings, result} = co.parse(rawSchema, config);
  if (errors) return {errors, warnings, result};

  await Promise.all(
    config.plugins.map(async (plugin) => {
      try {
        // config()
        if (plugin.config) plugin.config(config);

        // build()
        const results = await plugin.build({tokens: result.tokens, metadata: result.metadata, rawSchema});
        if (!results) return;
        if (!Array.isArray(results) || !results.every((r) => r.filename && r.contents)) {
          throw new Error(`[${plugin.name}] invalid build results`);
        }
        for (const {filename, contents} of results) {
          const filePath = new URL(filename.replace(/^\//, ''), config.outDir);
          fs.mkdirSync(new URL('./', filePath), {recursive: true});
          fs.writeFileSync(filePath, contents);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[${plugin.name}] ${err}`);
        throw err;
      }
    }),
  );

  return {errors, warnings, result};
}
