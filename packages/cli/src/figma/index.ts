import type { Config, TokenValue } from '@cobalt-ui/core';
import type figma from 'figma-js';
import fetch from 'node-fetch';
import { colorToHex } from './rgb.js';

const FIGMA_API = `https://api.figma.com/`;

async function load(config: Config): Promise<Record<string, TokenValue>> {
  if (!config.figma) throw new Error(`"figma" missing in cobalt.config.mjs (see https://cobalt-ui.pages.dev)`);
  if (!Object.keys(config.figma).length) throw new Error(`No Figma files found in cobalt.config.mjs`);

  const tokenUpdates: Record<string, TokenValue> = {};

  await Promise.all(
    Object.entries(config.figma).map(async ([shareURL, mappings]) => {
      const fileMatch = shareURL.match(/\/file\/([^/]+)/);
      if (!fileMatch) throw new Error(`Bad Figma URL: "${shareURL}". Please use URL from "Share" > "Copy Link"`);
      const doc = await fetchFile(fileMatch[1]);

      const components = collectComponents(doc.document);
      for (const [name, properties] of Object.entries(mappings)) {
        const component = components.get(name);
        if (!component) {
          console.warn(`Could not find component "${name}" in ${shareURL}`); // eslint-disable-line no-console
          continue;
        }

        for (const [property, cobaltIDs] of Object.entries(properties)) {
          switch (property) {
            case 'fill':
            case 'fills': {
              const fills = collectFills(component);
              const ids = Array.isArray(cobaltIDs) ? cobaltIDs : [cobaltIDs];

              // TODO: add gradients

              if (!fills[0].color) break;
              const hex = colorToHex(fills[0].color);

              for (const key of ids) {
                const parts = key.split('.');
                const value = parts.pop() as string;
                const id = parts.join('.');
                tokenUpdates[id] = { ...(tokenUpdates[id] || {}), [value]: hex } as TokenValue;
              }
              break;
            }
            default: {
              console.warn(`Unknown property "${property}" (it may not be implemented yet)`); // eslint-disable-line no-console
            }
          }
        }
      }
    })
  );

  return tokenUpdates;
}

/** collect all components within document */
function collectComponents(node: figma.Node, components: Map<string, figma.Component> = new Map()): Map<string, figma.Component> {
  if (node.type === 'COMPONENT') {
    if (components.has(node.name)) {
      console.warn(`Duplicate component name found "${node.name}". Tokens may not generate as expected.`); // eslint-disable-line no-console
    } else {
      components.set(node.name, node);
    }
    return components;
  }

  const { children } = node as figma.Group;
  if (!Array.isArray(children) || !children.length) return components;

  for (const child of children) {
    collectComponents(child, components);
  }

  return components;
}

/** get Figma document */
async function fetchFile(id: string): Promise<figma.FileResponse> {
  const { FIGMA_API_KEY } = process.env;
  if (!FIGMA_API_KEY) throw new Error(`FIGMA_API_KEY not set`);
  return fetch(new URL(`/v1/files/${id}`, FIGMA_API).href, {
    method: 'GET',
    headers: {
      'X-Figma-Token': FIGMA_API_KEY,
    },
  }).then((res) => res.json()) as any;
}

/** collect fills from node */
function collectFills(node: figma.Node, allFills: figma.Paint[] = []): figma.Paint[] {
  const { fills, children } = node as figma.FrameBase;
  if (Array.isArray(fills) && fills.length) {
    for (const fill of fills) {
      if (fill.visible !== false) allFills.push(fill);
    }
  }
  if (Array.isArray(children) && children.length) {
    for (const child of children) {
      collectFills(child, allFills);
    }
  }
  return allFills;
}

export default load;
