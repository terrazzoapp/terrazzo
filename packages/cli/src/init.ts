import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { confirm, intro, multiselect, outro, select, spinner } from '@clack/prompts';
import type { Logger } from '@terrazzo/parser';
import { pluralize } from '@terrazzo/token-tools';
import { detect } from 'detect-package-manager';
import { generate } from 'escodegen';
import { type ESTree, parseModule } from 'meriyah';
import { cwd, DEFAULT_CONFIG_PATH, DEFAULT_TOKENS_PATH, loadConfig, printError } from './shared.js';

const INSTALL_COMMAND = {
  npm: 'install -D --silent',
  yarn: 'add -D --silent',
  pnpm: 'add -D --silent',
  bun: 'install -D --silent',
};

// Local copy of dtcg-examples/index.json. Copied partially for security (no
// arbitrary injection of URL fetches), but also efficiency (saves a
// round-trip).
type DesignSystem =
  | 'adobe-spectrum'
  | 'apple-hig'
  | 'figma-sds'
  | 'github-primer'
  | 'ibm-carbon'
  | 'microsoft-fluent'
  | 'radix'
  | 'salesforce-lightning'
  | 'shopify-polaris';

const DTCG_ROOT_URL = 'https://raw.githubusercontent.com/terrazzoapp/dtcg-examples/refs/heads/main/';
const DESIGN_SYSTEMS: Record<DesignSystem, { name: string; author: string; tokens: string[] }> = {
  'adobe-spectrum': {
    name: 'Spectrum',
    author: 'Adobe',
    tokens: ['adobe-spectrum.json'],
  },
  'apple-hig': {
    name: 'Human Interface Guidelines',
    author: 'Apple',
    tokens: ['apple-hig.json'],
  },
  'figma-sds': {
    name: 'Simple Design System',
    author: 'Figma',
    tokens: ['figma-sds.json'],
  },
  'github-primer': {
    name: 'Primer',
    author: 'GitHub',
    tokens: ['github-primer.json'],
  },
  'ibm-carbon': {
    name: 'Carbon',
    author: 'IBM',
    tokens: ['ibm-carbon.json'],
  },
  'microsoft-fluent': {
    name: 'Fluent',
    author: 'Microsoft',
    tokens: ['microsoft-fluent.json'],
  },
  radix: {
    name: 'Radix',
    author: 'Radix',
    tokens: ['radix.json'],
  },
  'salesforce-lightning': {
    name: 'Lightning',
    author: 'Salesforce',
    tokens: ['salesforce-lightning.json'],
  },
  'shopify-polaris': {
    name: 'Polaris',
    author: 'Shopify',
    tokens: ['shopify-polaris.json'],
  },
};

export interface InitOptions {
  logger: Logger;
}

export async function initCmd({ logger }: InitOptions) {
  try {
    intro('⛋ Welcome to Terrazzo');
    const packageManager = await detect({ cwd: fileURLToPath(cwd) });

    // TODO: pass in CLI flags?
    const { config, configPath } = await loadConfig({ cmd: 'init', flags: {}, logger });
    const relConfigPath = configPath
      ? path.relative(fileURLToPath(cwd), fileURLToPath(new URL(configPath)))
      : undefined;

    let tokensPath = config.tokens[0]!;
    let startFromDS = !(tokensPath && fs.existsSync(tokensPath));

    // 1. tokens
    if (tokensPath && fs.existsSync(tokensPath)) {
      if (
        await confirm({
          message: `Found tokens at ${path.relative(fileURLToPath(cwd), fileURLToPath(tokensPath))}. Overwrite with a new design system?`,
        })
      ) {
        startFromDS = true;
      }
    } else {
      tokensPath = DEFAULT_TOKENS_PATH;
    }

    if (startFromDS) {
      const ds = DESIGN_SYSTEMS[
        (await select({
          message: 'Start from existing design system?',
          options: [
            ...Object.entries(DESIGN_SYSTEMS).map(([id, { author, name }]) => ({
              value: id,
              label: `${author} ${name}`,
            })),
            { value: 'none', label: 'None' },
          ],
        })) as keyof typeof DESIGN_SYSTEMS
      ] as (typeof DESIGN_SYSTEMS)[DesignSystem] | undefined;
      if (ds) {
        // TODO: support multiple tokens files?
        const s = spinner();
        s.start('Downloading');
        const tokenSource = await fetch(new URL(ds.tokens[0]!, DTCG_ROOT_URL)).then((res) => res.text());
        fs.writeFileSync(tokensPath, tokenSource);
        s.stop('Download complete');
      }
    }

    // 2. plugins
    const existingPlugins = config.plugins.map((p) => p.name);
    const pluginSelection = await multiselect({
      message: 'Install plugins?',
      options: [
        { value: ['@terrazzo/plugin-css'], label: 'CSS' },
        { value: ['@terrazzo/plugin-js'], label: 'JS + TS' },
        { value: ['@terrazzo/plugin-css', '@terrazzo/plugin-sass'], label: 'Sass' },
        { value: ['@terrazzo/plugin-tailwind'], label: 'Tailwind' },
      ],
      required: false,
    });
    const newPlugins = Array.isArray(pluginSelection)
      ? Array.from(new Set(pluginSelection.flat().filter((p) => !existingPlugins.includes(p))))
      : [];
    if (newPlugins?.length) {
      const plugins = newPlugins.map((p) => ({ specifier: p.replace('@terrazzo/plugin-', ''), package: p }));
      const pluginCount = `${newPlugins.length} ${pluralize(newPlugins.length, 'plugin', 'plugins')}`;

      const s = spinner();
      s.start(`Installing ${pluginCount}`);
      // note: thi sis async to show the spinner
      await new Promise((resolve, reject) => {
        const subprocess = exec([packageManager, INSTALL_COMMAND[packageManager], newPlugins.join(' ')].join(' '), {
          cwd,
        });
        subprocess.on('error', reject);
        subprocess.on('exit', resolve);
      });
      s.message('Updating config');
      if (configPath) {
        const ast = parseModule(fs.readFileSync(configPath, 'utf8'));
        const astExport = ast.body.find((node) => node.type === 'ExportDefaultDeclaration');

        // 2a. add plugin imports
        // note: this has the potential to duplicate plugins, but we tried our
        // best to filter already, and this may be the user’s fault if they
        // selected to install a plugin already installed. But also, this is
        // easily-fixable, so let’s not waste too much time here (and possibly
        // introduce bugs).
        ast.body.push(
          ...plugins.map(
            (p) =>
              ({
                type: 'ImportDeclaration',
                source: { type: 'Literal', value: p.package },
                specifiers: [{ type: 'ImportDefaultSpecifier', local: { type: 'Identifier', name: p.specifier } }],
                attributes: [],
              }) as ESTree.ImportDeclaration,
          ),
        );

        // 2b. add plugins to config.plugins
        if (!astExport) {
          logger.error({ group: 'config', message: `SyntaxError: ${relConfigPath} does not have default export.` });
          return;
        }
        const astConfig = (
          astExport.declaration.type === 'CallExpression'
            ? // export default defineConfig({ ... })
              astExport.declaration.arguments[0]
            : // export default { ... }
              astExport.declaration
        ) as ESTree.ObjectExpression;
        if (astConfig.type !== 'ObjectExpression') {
          logger.error({
            group: 'config',
            message: `Config: expected object default export, received ${astConfig.type}`,
          });
          return;
        }
        const pluginsArray = (
          astConfig.properties.find(
            (property) =>
              property.type === 'Property' && property.key.type === 'Identifier' && property.key.name === 'plugins', // ASTs are so fun 😑
          ) as ESTree.Property
        )?.value as ESTree.ArrayExpression | undefined;
        const pluginsAst = plugins.map(
          (p) =>
            ({
              type: 'CallExpression' as const,
              callee: {
                type: 'Identifier' as const,
                name: p.specifier,
              },
              arguments: [],
              optional: false,
            }) as ESTree.CallExpression,
        );
        if (pluginsArray) {
          pluginsArray.elements.push(...pluginsAst);
        } else {
          astConfig.properties.push({
            type: 'Property',
            key: { type: 'Identifier', name: 'plugins' },
            value: { type: 'ArrayExpression', elements: pluginsAst },
            kind: 'init',
            computed: false,
            method: false,
            shorthand: false,
          });
        }

        // 2c. update new file (and we’ll probably format it wrong but hey)
        fs.writeFileSync(
          configPath,
          generate(ast, {
            format: {
              indent: { style: '  ' },
              quotes: 'single',
              semicolons: true,
            },
          }),
        );
      } else {
        // 2a. write new config file (easy)
        fs.writeFileSync(
          DEFAULT_CONFIG_PATH,
          `import { defineConfig } from '@terrazzo/cli';
${plugins.map((p) => `import ${p.specifier} from '${p.package}';`).join('\n')}

export default defineConfig({
  tokens: ['./tokens.json'],
  plugins: [
    ${plugins.map((p) => `${p.specifier}(),`).join('\n    ')}
  ],
  outDir: './dist/',
  lint: {
    /** @see https://terrazzo.app/docs/linting */
    enabled: true,
    rules: {
      'core/valid-color': 'error',
      'core/valid-dimension': 'error',
      'core/valid-font-family': 'error',
      'core/valid-font-weight': 'error',
      'core/valid-duration': 'error',
      'core/valid-cubic-bezier': 'error',
      'core/valid-number': 'error',
      'core/valid-link': 'error',
      'core/valid-boolean': 'error',
      'core/valid-string': 'error',
      'core/valid-stroke-style': 'error',
      'core/valid-border': 'error',
      'core/valid-transition': 'error',
      'core/valid-shadow': 'error',
      'core/valid-gradient': 'error',
      'core/valid-typography': 'error',
      'core/consistent-naming': 'warn',
    },
  },
});`,
        );
      }
      s.stop(`Installed ${pluginCount}`);
    }

    outro('⛋ Done! 🎉');
  } catch (err) {
    printError((err as Error).message);
    process.exit(1);
  }
}
