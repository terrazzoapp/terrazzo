import type { Plugin, ResolverInput } from '@terrazzo/parser';
import { tokenToColor } from '@terrazzo/token-tools';
import { to as convert } from 'colorjs.io/fn';

/* oxlint-disable require-await */

export const FORMAT = 'android';

const PLUGIN_NAME = '@terrazzo/plugin-android';

const DEFAULT_LIGHT: ResolverInput = { theme: 'light' };
const DEFAULT_DARK: ResolverInput = { theme: 'dark' };

export interface AndroidPluginOptions {
  /**
   * Kotlin package for the generated file (e.g. "com.example.tokens"). Omitted from the file if not set.
   */
  packageName?: string;
  /**
   * Name of the generated interface, and the prefix of its light and dark objects. Also the filename.
   * @default "Tokens"
   */
  objectName?: string;
  /**
   * Resolver input for the light object.
   * @default { theme: "light" }
   */
  light?: ResolverInput;
  /**
   * Resolver input for the dark object. Without a valid one, no dark object is generated.
   * @default { theme: "dark" }
   */
  dark?: ResolverInput;
}

/** Kotlin hard keywords, which can’t be used as a property name without backticks */
const KOTLIN_KEYWORDS = new Set([
  'as',
  'break',
  'class',
  'continue',
  'do',
  'else',
  'false',
  'for',
  'fun',
  'if',
  'in',
  'interface',
  'is',
  'null',
  'object',
  'package',
  'return',
  'super',
  'this',
  'throw',
  'true',
  'try',
  'typealias',
  'typeof',
  'val',
  'var',
  'when',
  'while',
]);

export default function PluginAndroid({
  packageName,
  objectName = 'Tokens',
  light: lightOption,
  dark: darkOption,
}: AndroidPluginOptions = {}): Plugin {
  // Set by transform, read by build. Undefined means fall back to $extensions.mode.
  let lightInput: ResolverInput | undefined;
  let darkInput: ResolverInput | undefined;

  function meta(id: string) {
    return { 'token-listing': { name: `${objectName}.${toPropertyName(id)}` } };
  }

  return {
    name: PLUGIN_NAME,
    async transform({ tokens, resolver, setTransform }) {
      // An input the user passed must be valid, so error on it. The defaults only apply if the resolver has a "theme" modifier.
      const light = lightOption ?? DEFAULT_LIGHT;
      const dark = darkOption ?? DEFAULT_DARK;
      lightInput = resolver.isValidInput(light, !!lightOption) ? light : undefined;
      darkInput = lightInput && resolver.isValidInput(dark, !!darkOption) ? dark : undefined;

      if (lightInput) {
        for (const input of [lightInput, darkInput]) {
          if (!input) {
            continue;
          }
          for (const token of Object.values(resolver.apply(input))) {
            // TODO: other types
            if (token.$type === 'color') {
              setTransform(token.id, {
                format: FORMAT,
                input,
                value: toComposeColor(token.$value),
                meta: meta(token.id),
              });
            }
          }
        }
        return;
      }

      // No resolver input matched: read $extensions.mode instead
      for (const [id, token] of Object.entries(tokens)) {
        if (token.$type !== 'color') {
          continue;
        }
        for (const [mode, modeValue] of Object.entries(token.mode)) {
          if (!modeValue) {
            continue;
          }
          setTransform(id, {
            format: FORMAT,
            mode,
            value: toComposeColor(modeValue.$value),
            meta: meta(token.id),
          });
        }
      }
    },
    async build({ context, getTransforms, outputFile }) {
      function getLight(id: string) {
        return lightInput
          ? getTransforms({ id, format: FORMAT, input: lightInput })
          : getTransforms({ id, format: FORMAT, mode: '.' });
      }
      function getDark(id: string) {
        if (darkInput) {
          return getTransforms({ id, format: FORMAT, input: darkInput });
        }
        return lightInput ? [] : getTransforms({ id, format: FORMAT, mode: 'dark' });
      }

      const colors = getLight('*').toSorted((a, b) =>
        a.token.id.localeCompare(b.token.id, 'en', { numeric: true }),
      );
      if (colors.length === 0) {
        return;
      }

      const seen = new Map<string, string>();
      const members: {
        name: string;
        description?: string;
        light: string;
        dark: string | undefined;
      }[] = [];
      for (const token of colors) {
        const name = toPropertyName(token.token.id);
        const existing = seen.get(name);
        if (existing) {
          context.logger.error({
            group: 'plugin',
            label: PLUGIN_NAME,
            message: `Tokens ${existing} and ${token.token.id} both map to the Kotlin property ${name}`,
          });
        }
        seen.set(name, token.token.id);
        const [darkToken] = getDark(token.token.id);
        members.push({
          name,
          description: token.token.$description,
          light: token.value as string,
          dark: darkToken?.value as string | undefined,
        });
      }
      const hasDark = members.some((m) => m.dark !== undefined);

      const lines: string[] = ['// This file was generated by Terrazzo. Do not edit.', ''];
      if (packageName) {
        lines.push(`package ${packageName}`, '');
      }
      lines.push(
        'import androidx.compose.ui.graphics.Color',
        'import androidx.compose.ui.graphics.colorspace.ColorSpaces',
        '',
        `interface ${objectName} {`,
      );
      for (const { name, description } of members) {
        if (description) {
          lines.push(
            `  /** ${description.replaceAll('*/', '* /').replaceAll(/\s*\n\s*/g, ' ')} */`,
          );
        }
        lines.push(`  val ${name}: Color`);
      }
      lines.push('}', '', `object ${objectName}Light : ${objectName} {`);
      for (const { name, light } of members) {
        lines.push(`  override val ${name} = ${light}`);
      }
      lines.push('}');
      if (hasDark) {
        lines.push('', `object ${objectName}Dark : ${objectName} {`);
        for (const { name, light, dark } of members) {
          lines.push(`  override val ${name} = ${dark ?? light}`);
        }
        lines.push('}');
      }

      outputFile(`${objectName}.kt`, `${lines.join('\n')}\n`);
    },
  };
}

/** Token ID → camelCase Kotlin property name (color.primitive.blue.1 → colorPrimitiveBlue1) */
export function toPropertyName(id: string): string {
  const words = id.split(/[^A-Za-z0-9]+/).filter(Boolean);
  let name = words
    .map((word, i) =>
      i === 0
        ? word.charAt(0).toLowerCase() + word.slice(1)
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('');
  if (/^[0-9]/.test(name)) {
    name = `_${name}`;
  }
  return KOTLIN_KEYWORDS.has(name) ? `\`${name}\`` : name;
}

/** Color token value → Compose Color in Display P3, mapped into gamut */
function toComposeColor(value: Parameters<typeof tokenToColor>[0]): string {
  const {
    coords: [red, green, blue],
    alpha,
  } = convert(tokenToColor(value), 'p3', { inGamut: true });
  return `Color(${[red, green, blue, alpha].map(toFloat).join(', ')}, ColorSpaces.DisplayP3)`;
}

/** Kotlin Float literal, rounded to what a Float can hold (0.984313725 → 0.984314f, 1 → 1f) */
function toFloat(v: unknown): string {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : 0;
  return `${Number(n.toFixed(6))}f`;
}
