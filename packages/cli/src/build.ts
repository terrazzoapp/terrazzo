import co, { type Group, type ParseResult, type ResolvedConfig } from '@cobalt-ui/core';
import fs from 'node:fs';
import { URL } from 'node:url';
import lint from './lint.js';

export default async function build(rawSchema: Group, config: ResolvedConfig): Promise<ParseResult> {
  const { errors = [], warnings = [], result } = co.parse(rawSchema, config);
  if (errors.length) {
    return { errors, warnings, result };
  }

  // 1. Config
  config.plugins.map((plugin) => {
    try {
      if (plugin.config) {
        plugin.config(config);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[${plugin.name}] ${err}`);
      throw err;
    }
  });

  // 2. Lint
  if (config.lint.build.enabled) {
    const lintResult = await lint({ config, warnIfNoPlugins: false, tokens: result.tokens, rawSchema });
    errors.push(...(lintResult.errors ?? []));
    warnings.push(...(lintResult.warnings ?? []));

    if (errors?.length) {
      return { errors, warnings, result };
    }
  }

  // 3. Build
  await Promise.all(
    config.plugins.map(async (plugin) => {
      if (typeof plugin.build !== 'function') {
        return;
      }

      try {
        // build()
        const results = await plugin.build({ tokens: result.tokens, metadata: result.metadata, rawSchema });
        if (!results) {
          return;
        }
        if (!Array.isArray(results) || !results.every((r) => r.filename && r.contents)) {
          throw new Error(`[${plugin.name}] invalid build results`);
        }
        for (const { filename, contents } of results) {
          const filePath = new URL(filename.replace(/^\//, ''), config.outDir);
          fs.mkdirSync(new URL('./', filePath), { recursive: true });
          fs.writeFileSync(filePath, contents);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[${plugin.name}] ${err}`);
        throw err;
      }
    }),
  );

  return {
    errors: errors.length ? errors : undefined,
    warnings: warnings.length ? warnings : undefined,
    result,
  };
}
