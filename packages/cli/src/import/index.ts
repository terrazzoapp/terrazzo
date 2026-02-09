import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import type { Logger } from '@terrazzo/parser';
import { pluralize } from '@terrazzo/token-tools';
import { importFromFigma, isFigmaPath } from './figma/index.js';
import { formatNumber } from './figma/lib.js';

export * from './figma/index.js';

export interface ImportCmdOptions {
  flags: {
    /** The output file @default stdout */
    output?: string;
  } & Record<string, any>;
  positionals: string[];
  logger: Logger;
}

export async function importCmd({ flags, positionals, logger }: ImportCmdOptions) {
  const [_cmd, url] = positionals;
  if (!url) {
    logger.error({
      group: 'import',
      message: 'Missing import path. Expected `tz import [file]`.',
    });
  }

  if (isFigmaPath(url!)) {
    const { FIGMA_ACCESS_TOKEN } = process.env;
    if (!FIGMA_ACCESS_TOKEN) {
      logger.error({
        group: 'import',
        message: `FIGMA_ACCESS_TOKEN not set! See https://terrazzo.app/docs/guides/import-from-figma`,
      });
    }

    const start = performance.now();
    const result = await importFromFigma({
      url: url!,
      logger,
      unpublished: flags.unpublished,
      skipStyles: flags['skip-styles'],
      skipVariables: flags['skip-variables'],
      fontFamilyNames: flags['font-family-names'],
      fontWeightNames: flags['font-weight-names'],
      numberNames: flags['number-names'],
    });
    const end = performance.now() - start;

    if (flags.output) {
      const oldFile = fsSync.existsSync(flags.output) ? JSON.parse(await fs.readFile(flags.output, 'utf8')) : {};
      // merge with old file, if any
      const code = {
        $schema: result.code.$schema, // Reset $schema
        version: result.code.version, // Reset version
        // Note: it’s important to have resolutionOrder higher up, since sets and modifiers will be a mess
        resolutionOrder: oldFile.resolutionOrder?.length ? oldFile.resolutionOrder : result.code.resolutionOrder, // Rely on old file, since the Figma file won’t understand resolutionOrder
        sets: result.code.sets, // Overwrite old sets
        modifiers: result.code.modifiers, // Overwrite old modifiers
        $defs: oldFile.$defs, // Just in case
        $extensions: oldFile.$extensions, // Just in case
      };
      await fs.writeFile(flags.output, `${JSON.stringify(code, undefined, 2)}\n`);
      logger.info({
        group: 'import',
        message: `Imported ${formatNumber(result.variableCount)} ${pluralize(result.variableCount, 'Variable', 'Variables')}, ${formatNumber(result.styleCount)} ${pluralize(result.styleCount, 'Style', 'Styles')} → ${flags.output}`,
        timing: end,
      });
    } else {
      process.stdout.write(JSON.stringify(result.code));
    }

    return;
  }

  // Other imports here
}
