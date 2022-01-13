import type * as Figma from 'figma-api';
import type { GetFileResult } from 'figma-api/lib/api-types';
import { FG_RED, RESET, UNDERLINE } from '@cobalt-ui/utils';
import undici from 'undici';
import stream from 'stream';

const SHARE_URL_RE = /^https:\/\/www\.figma\.com\/file\/([A-Za-z0-9]+)\//;
const FIGMA = {
  FILES: 'https://api.figma.com/v1/files/',
  IMAGES: 'https://api.figma.com/v1/images/',
};

/** collect all components within document */
export function collectComponents(node: Figma.Node, components: Map<string, Figma.COMPONENT> = new Map()): Map<string, Figma.COMPONENT> {
  if (node.type === 'COMPONENT') {
    if (components.has(node.name)) {
      console.warn(`Duplicate component name found "${node.name}". Tokens may not generate as expected.`); // eslint-disable-line no-console
    } else {
      components.set(node.name, node as Figma.COMPONENT);
    }
    return components;
  }

  const { children } = node as Figma.GROUP;
  if (!Array.isArray(children) || !children.length) return components;

  for (const child of children) {
    collectComponents(child, components);
  }

  return components;
}

/** collect fills from node */
export function collectFills(node: Figma.Node, allFills: Figma.Paint[] = []): Figma.Paint[] {
  const { fills, children } = node as Figma.FRAME;
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

export interface StrokeGroup {
  strokes: Figma.FRAME['strokes'];
  strokeWeight: Figma.FRAME['strokeWeight'];
  strokeAlign: Figma.FRAME['strokeAlign'];
}

/** collect fills from node */
export function collectStrokes(node: Figma.Node, allStrokes: StrokeGroup[] = []): StrokeGroup[] {
  const { children, strokes, strokeWeight, strokeAlign } = node as Figma.FRAME;
  if (Array.isArray(strokes) && strokes.length) {
    allStrokes.push({ strokes, strokeWeight, strokeAlign });
  }
  if (Array.isArray(children) && children.length) {
    for (const child of children) {
      collectStrokes(child, allStrokes);
    }
  }
  return allStrokes;
}

/** Get Figma document */
export async function fetchDoc(shareURL: string): Promise<GetFileResult> {
  if (!process.env.FIGMA_API_KEY)
    throw new Error(
      `  ${FG_RED}✘  FIGMA_API_KEY not set. See ${UNDERLINE}https://www.figma.com/developers/api#access-tokens${RESET}${FG_RED} for instructions.${RESET}`
    );
  if (!SHARE_URL_RE.test(shareURL)) throw new Error(`  ${FG_RED}✘  Share URL must match ${UNDERLINE}https://www.figma.com/file/[id]${RESET}`);
  const id = (shareURL.match(SHARE_URL_RE) as RegExpMatchArray)[1];
  const res = await undici.request(`${FIGMA.FILES}${id}`, {
    method: 'GET',
    headers: {
      'X-Figma-Token': process.env.FIGMA_API_KEY,
    },
  });
  if (res.statusCode != 200) throw new Error(await res.body.text());
  return await res.body.json();
}

/** export file from Figma */
export async function fetchImg(id: string, componentID: string, format: 'png' | 'svg' | 'jpg' | 'pdf'): Promise<Uint8Array> {
  if (!process.env.FIGMA_API_KEY)
    throw new Error(
      `  ${FG_RED}✘  FIGMA_API_KEY not set. See ${UNDERLINE}https://www.figma.com/developers/api#access-tokens${RESET}${FG_RED} for instructions.${RESET}`
    );
  const search = new URLSearchParams({
    ids: componentID,
    format: format,
  });

  // First, get download link from Figma
  const imgRes = await undici.request(`${FIGMA.IMAGES}${id}/?${search.toString()}`, {
    method: 'GET',
    headers: {
      'X-Figma-Token': process.env.FIGMA_API_KEY,
    },
  });
  if (imgRes.statusCode !== 200) throw new Error(await imgRes.body.text());
  const imgUrl = (await imgRes.body.json()).images[componentID];
  if (!imgUrl) throw new Error(`Could not fetch image for component ${componentID}"`);

  // Next, download data (using streaming for best results)
  const bufs: Uint8Array[] = [];
  await undici.stream(
    imgUrl,
    { method: 'GET', opaque: { bufs } },
    (res) =>
      new stream.Writable({
        write(chunk, _, callback): void {
          (res.opaque as any).bufs.push(chunk);
          callback();
        },
      })
  );
  return Buffer.concat(bufs);
}
