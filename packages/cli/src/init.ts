import { spawn } from 'node:child_process';
import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { confirm, intro, multiselect, outro, select, spinner } from '@clack/prompts';
import type { Logger } from '@terrazzo/parser';
import { pluralize } from '@terrazzo/token-tools';
import { detect } from 'detect-package-manager';
import { generate } from 'escodegen';
import { type ESTree, parseModule } from 'meriyah';
import { cwd, loadConfig, printError } from './shared.js';

const INSTALL_COMMAND = {
  npm: 'install -D --silent',
  yarn: 'add -D --silent',
  pnpm: 'add -D --silent',
  bun: 'install -D --silent',
};

const SYNTAX_SETTINGS = {
  format: {
    indent: { style: '  ' },
    quotes: 'single',
    semicolons: true,
  },
};

const EXAMPLE_TOKENS_PATH = 'my-tokens.tokens.json';

interface ImportSpec {
  specifier: string;
  path: string;
}

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
  | 'shopify-polaris';

const DESIGN_SYSTEMS: Record<DesignSystem, { name: string; author: string; tokens: string[] }> = {
  'adobe-spectrum': {
    name: 'Spectrum',
    author: 'Adobe',
    tokens: ['dtcg-examples/adobe-spectrum.resolver.json'],
  },
  'apple-hig': {
    name: 'Human Interface Guidelines',
    author: 'Apple',
    tokens: ['dtcg-examples/apple-hig.resolver.json'],
  },
  'figma-sds': {
    name: 'Simple Design System',
    author: 'Figma',
    tokens: ['dtcg-examples/figma-sds.resolver.json'],
  },
  'github-primer': {
    name: 'Primer',
    author: 'GitHub',
    tokens: ['dtcg-examples/github-primer.resolver.json'],
  },
  'ibm-carbon': {
    name: 'Carbon',
    author: 'IBM',
    tokens: ['dtcg-examples/ibm-carbon.resolver.json'],
  },
  'microsoft-fluent': {
    name: 'Fluent',
    author: 'Microsoft',
    tokens: ['dtcg-examples/microsoft-fluent.resolver.json'],
  },
  'shopify-polaris': {
    name: 'Polaris',
    author: 'Shopify',
    tokens: ['dtcg-examples/shopify-polaris.resolver.json'],
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
    const { config, configPath = 'terrazzo.config.ts' } = await loadConfig({ cmd: 'init', flags: {}, logger });
    const tokensPath = config.tokens[0]!;
    const hasExistingConfig = fsSync.existsSync(configPath);
    let startFromDS = !(tokensPath && fsSync.existsSync(tokensPath));

    // 1. tokens
    if (tokensPath && fsSync.existsSync(tokensPath)) {
      if (
        await confirm({
          message: `Found tokens at ${path.relative(fileURLToPath(cwd), fileURLToPath(tokensPath))}. Overwrite with a new design system?`,
        })
      ) {
        startFromDS = true;
      }
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
        const s = spinner();
        s.start('Downloading');
        await new Promise((resolve, reject) => {
          // security: spawn() is much safer than exec()
          const subprocess = spawn(packageManager, [INSTALL_COMMAND[packageManager], 'dtcg-examples'], { cwd });
          subprocess.on('error', reject);
          subprocess.on('exit', resolve);
        });
        s.stop('Download complete');

        if (hasExistingConfig) {
          await updateConfigTokens(configPath, ds.tokens);
        } else {
          await newConfigFile(configPath, ds.tokens);
        }
      } else {
        startFromDS = false; // we’ll use this later in the final check
      }
    }

    // 2. If a user selected no DS, and doesn’t have a config file, create one
    if (!hasExistingConfig) {
      await newConfigFile(configPath, [EXAMPLE_TOKENS_PATH]);
      await fs.writeFile(EXAMPLE_TOKENS_PATH, JSON.stringify(EXAMPLE_TOKENS, undefined, 2));
    }

    // 3. plugins
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
      const plugins: ImportSpec[] = newPlugins.map((p) => ({ specifier: p.replace('@terrazzo/plugin-', ''), path: p }));
      const pluginCount = `${newPlugins.length} ${pluralize(newPlugins.length, 'plugin', 'plugins')}`;
      const s = spinner();
      s.start(`Installing ${pluginCount}`);
      // note: this is async to show the spinner
      await new Promise((resolve, reject) => {
        // security: spawn() is much safer than exec()
        const subprocess = spawn(packageManager, [INSTALL_COMMAND[packageManager], newPlugins.join(' ')], { cwd });
        subprocess.on('error', reject);
        subprocess.on('exit', resolve);
      });
      s.message('Updating config');

      await updateConfigPlugins(configPath, plugins);

      s.stop(`Installed ${pluginCount}`);
    }

    // 4. No tokens, no plugins
    if (!startFromDS && !newPlugins?.length) {
      outro('Nothing to do. Exiting.');
      return;
    }

    outro('⛋ Done! 🎉');
  } catch (err) {
    printError((err as Error).message);
    process.exit(1);
  }
}

async function newConfigFile(configPath: string, tokens: string[], imports: ImportSpec[] = []) {
  await fs.writeFile(
    configPath,
    `import { defineConfig } from '@terrazzo/cli';
${imports.map((p) => `import ${p.specifier} from '${p.path}';`).join('\n')}

export default defineConfig({
  tokens: ['${tokens.join("', '")}'],
  plugins: [
    ${imports.length ? imports.map((p) => `${p.specifier}(),`).join('\n    ') : '/** @see https://terrazzo.app/docs */'}
  ],
  outDir: './dist/',
  lint: {
    /** @see https://terrazzo.app/docs/linting */
    build: {
      enabled: true,
    },
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

function getConfigObjFromAst(ast: ESTree.Program, configPath: string) {
  const astExport = ast.body.find((node) => node.type === 'ExportDefaultDeclaration');
  if (!astExport) {
    const relConfigPath = configPath
      ? path.relative(fileURLToPath(cwd), fileURLToPath(new URL(configPath)))
      : undefined;
    throw new Error(`SyntaxError: ${relConfigPath} does not have default export.`);
  }

  const astConfig = (
    astExport.declaration.type === 'CallExpression'
      ? // export default defineConfig({ ... })
        astExport.declaration.arguments[0]
      : // export default { ... }
        astExport.declaration
  ) as ESTree.ObjectExpression;

  if (astConfig.type !== 'ObjectExpression') {
    throw new Error(`Config: expected object default export, received ${astConfig.type}.`);
  }

  return astConfig;
}

async function updateConfigTokens(configPath: string, tokens: string[]) {
  const ast = parseModule(await fs.readFile(configPath, 'utf8'));
  const astConfig = getConfigObjFromAst(ast, configPath);

  let tokensKey = astConfig.properties.find(
    (p) => p.type === 'Property' && p.key.type === 'Identifier' && p.key.name === 'tokens',
  ) as ESTree.Property | undefined;
  if (!tokensKey) {
    tokensKey = {
      type: 'Property' as const,
      key: { type: 'Identifier', name: 'tokens' },
      method: false,
      computed: false,
      shorthand: false,
      value: {
        type: 'ArrayExpression',
        elements: tokens.map((value) => ({ type: 'Literal', value, raw: `'${value}'` })),
      },
    } as ESTree.Property;
    astConfig.properties.unshift(tokensKey); // inject into first position
  }

  await fs.writeFile(configPath, generate(ast, SYNTAX_SETTINGS));
}

/**
 * Add plugin imports
 * note: this has the potential to duplicate plugins, but we tried our
 * best to filter already, and this may be the user’s fault if they
 * selected to install a plugin already installed. But also, this is
 * easily-fixable, so let’s not waste too much time here (and possibly
 * introduce bugs).
 */
async function updateConfigPlugins(configPath: string, plugins: ImportSpec[]) {
  const ast = parseModule(await fs.readFile(configPath, 'utf8'));

  ast.body.push(
    ...plugins.map(
      (p) =>
        ({
          type: 'ImportDeclaration' as const,
          source: { type: 'Literal', value: p.path },
          specifiers: [{ type: 'ImportDefaultSpecifier', local: { type: 'Identifier', name: p.specifier } }],
          attributes: [],
        }) as ESTree.ImportDeclaration,
    ),
  );

  // add plugins to config.plugins
  const astConfig = getConfigObjFromAst(ast, configPath);
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
        callee: { type: 'Identifier' as const, name: p.specifier },
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

  await fs.writeFile(configPath, generate(ast, SYNTAX_SETTINGS));
}

const EXAMPLE_TOKENS = {
  color: {
    $description: 'Color tokens',
    black: {
      '100': {
        $type: 'color',
        $value: { colorSpace: 'srgb', components: [0.047, 0.047, 0.047], alpha: 0.05, hex: '#0c0c0d' },
      },
      '200': {
        $type: 'color',
        $value: { colorSpace: 'srgb', components: [0.047, 0.047, 0.047], alpha: 0.1, hex: '#0c0c0d' },
      },
      '300': {
        $type: 'color',
        $value: { colorSpace: 'srgb', components: [0.047, 0.047, 0.047], alpha: 0.2, hex: '#0c0c0d' },
      },
      '400': {
        $type: 'color',
        $value: { colorSpace: 'srgb', components: [0.047, 0.047, 0.047], alpha: 0.34, hex: '#0c0c04' },
      },
      '500': {
        $type: 'color',
        $value: { colorSpace: 'srgb', components: [0.047, 0.047, 0.047], alpha: 0.7, hex: '#0c0c0d' },
      },
      '600': {
        $type: 'color',
        $value: { colorSpace: 'srgb', components: [0.047, 0.047, 0.047], alpha: 0.8, hex: '#0c0c0d' },
      },
      '700': {
        $type: 'color',
        $value: { colorSpace: 'srgb', components: [0.047, 0.047, 0.047], alpha: 0.85, hex: '#0c0c0d' },
      },
      '800': {
        $type: 'color',
        $value: { colorSpace: 'srgb', components: [0.047, 0.047, 0.047], alpha: 0.9, hex: '#0c0c0d' },
      },
      '900': {
        $type: 'color',
        $value: { colorSpace: 'srgb', components: [0.047, 0.047, 0.047], alpha: 0.95, hex: '#0c0c0d' },
      },
      '1000': {
        $type: 'color',
        $value: { colorSpace: 'srgb', components: [0.047, 0.047, 0.047], alpha: 0, hex: '#0c0c0d' },
      },
    },
  },
  border: {
    $description: 'Border tokens',
    default: {
      type: 'border',
      $value: {
        color: '{color.black.900}',
        style: 'solid',
        width: { value: 1, unit: 'px' },
      },
    },
  },
  radius: {
    $description: 'Corner radius tokens',
    '100': { $value: { value: 0.25, unit: 'rem' } },
  },
  space: {
    $description: 'Dimension tokens',
    '100': { $value: { value: 0.25, unit: 'rem' } },
  },
  typography: {
    $description: 'Typography tokens',
    body: {
      $type: 'typography',
      $value: {
        fontFamily: '{typography.family.sans}',
        fontSize: '{typography.scale.03}',
        fontWeight: '{typography.weight.regular}',
        letterSpacing: { value: 0, unit: 'em' },
        lineHeight: 1,
      },
    },
  },
};
