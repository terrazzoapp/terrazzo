import type { FigmaToken, ResolvedConfig, Token } from '@cobalt-ui/core';
import type * as Figma from 'figma-api';
import Piscina from 'piscina';
import { fileURLToPath } from 'url';
import { collectChildren, collectStylesAndComponents, fetchDoc, padRight } from './util.js';
import { colorToHex } from './paint.js';

const LEADING_SLASH_RE = /^\//;
const TEXT_CASE: Record<Figma.TextCase, string | undefined> = {
  UPPER: 'uppercase',
  LOWER: 'lowercase',
  TITLE: 'capitalize',
  ORIGINAL: undefined,
  SMALL_CAPS: undefined,
  SMALL_CAPS_FORCED: undefined,
};

async function load(config: ResolvedConfig): Promise<Record<string, Token>> {
  // validate config
  if (!config.figma) throw new Error(`"figma" missing in tokens.config.mjs (see https://cobalt-ui.pages.dev)`);
  const { optimize: defaultOptimize = false } = config.figma;

  // create a workerpool for every file downloaded
  const fileQueue = new Piscina({
    filename: new URL('./file-worker.js', import.meta.url).href,
    maxQueue: 'auto',
  });

  // save final updates
  const tokenUpdates: Record<string, Token> = {};

  // optimization: make sure duplicate URLs are fetched together
  const docs: Record<string, FigmaToken[]> = {};
  let downloadCount = 0;
  let totalFiles = 0;
  for (const { url, tokens } of config.figma.docs) {
    totalFiles += tokens.reduce((count, token) => count + (token.type === 'file' ? 1 : 0), 0);
    docs[url] = [...(docs[url] || []), ...tokens];
  }
  let countWidth = String(totalFiles).length;

  // load all URLs
  await Promise.all(
    Object.entries(docs).map(async ([url, tokens]) => {
      const doc = await fetchDoc(url);
      const { styles, components } = collectStylesAndComponents(doc);

      await Promise.all(
        tokens.map(async ({ type: nodeType, token: id, style: styleName, component: componentName, filename, optimize: tokenOptimize }) => {
          const figmaName = styleName || componentName;
          const figmaNode = (styleName && styles.get(styleName)) || (componentName && components.get(componentName));
          if (!figmaNode) throw new Error(`could not locate "${figmaName}"`);

          switch (nodeType) {
            case 'color': {
              let node = figmaNode as any;
              if (!Array.isArray(node.fills) || !node.fills.length) {
                const children = collectChildren(node);
                node = children.find((n) => Array.isArray((n as any).fills) && (n as any).fills.length);
                if (!node) throw new Error(`${id}: could not find fills on "${figmaName}"`);
              }
              const solidFill = (node as Figma.VECTOR).fills.find((p) => p.type === 'SOLID' && !!p.color);
              if (!solidFill) throw new Error(`${id}: could not find solid fill on "${figmaName}"`);
              tokenUpdates[id] = {
                type: 'color',
                value: colorToHex(solidFill.color as Figma.Color),
              };
              break;
            }
            case 'file': {
              await fileQueue.run({
                url,
                componentID: figmaNode.id,
                filename: fileURLToPath(new URL((filename as string).replace(LEADING_SLASH_RE, './'), config.outDir)),
                optimize: tokenOptimize || defaultOptimize || false,
              });
              downloadCount += 1;
              console.log(`  ✔  Downloaded file ${padRight(String(downloadCount), countWidth)}/${totalFiles}`); // eslint-disable-line no-console
              tokenUpdates[id] = {
                type: 'file',
                value: filename as string,
              };
              break;
            }
            case 'gradient': {
              let node = figmaNode as any;
              if (!Array.isArray(node.fills) || !node.fills.length) {
                const children = collectChildren(node);
                node = children.find((n) => Array.isArray((n as any).fills) && (n as any).fills.length);
                if (!node) throw new Error(`${id}: could not find fills on "${figmaName}"`);
              }
              const gradientFill = (node as Figma.VECTOR).fills.find((p) => p.type.startsWith('GRADIENT_') && !!p.gradientStops && !!p.gradientStops.length);
              if (!gradientFill) throw new Error(`${id}: could not find gradient fill on "${figmaName}"`);
              const { gradientStops = [] } = gradientFill;
              tokenUpdates[id] = {
                type: 'gradient',
                value: gradientStops.map((stop) => ({ color: colorToHex(stop.color), position: stop.position })),
              };
              break;
            }
            case 'shadow': {
              let node = figmaNode as any;
              if (!node.effects || !node.effects.some((e: Figma.Effect) => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW')) {
                const children = collectChildren(node);
                node = children.find((n: any) => n.effects && n.effects.some((e: Figma.Effect) => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW'));
              }
              if (!node) throw new Error(`${id}: could not find shadow effect on "${figmaName}"`);
              const shadowEffect = node.effects.find((e: Figma.Effect) => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') as Figma.EffectShadow;
              tokenUpdates[id] = {
                type: 'shadow',
                value: {
                  'offset-x': shadowEffect.offset.x ? `${shadowEffect.offset.x}px` : '0',
                  'offset-y': shadowEffect.offset.y ? `${shadowEffect.offset.y}px` : '0',
                  blur: shadowEffect.radius ? `${shadowEffect.radius}px` : '0',
                  spread: '0',
                  color: colorToHex(shadowEffect.color),
                },
              };
              break;
            }
            case 'typography': {
              let node = figmaNode as any;
              if (node.type !== 'TEXT') {
                const children = collectChildren(node);
                node = children.find((n) => n.type === 'TEXT');
                if (!node) throw new Error(`${id}: could not find text style on "${figmaName}"`);
              }
              const { fontFamily, fontWeight, fontSize, italic, letterSpacing, lineHeightPercentFontSize, textCase } = node.style as Figma.TypeStyle;
              tokenUpdates[id] = {
                type: 'typography',
                value: {
                  'font-family': [fontFamily],
                  'font-size': `${fontSize}px`,
                  ...(italic ? { 'font-style': 'italic' } : {}),
                  'font-weight': fontWeight,
                  'letter-spacing': `${letterSpacing / fontSize}em`,
                  'line-height': (lineHeightPercentFontSize || 100) / 100,
                  ...(textCase && TEXT_CASE[textCase] ? { 'text-transform': TEXT_CASE[textCase] } : {}),
                },
              };
              break;
            }
          }
        })
      );
    })
  );

  return tokenUpdates;
}

export default load;
