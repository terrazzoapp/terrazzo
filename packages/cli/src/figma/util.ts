import type * as Figma from 'figma-api';
import { GetFileResult } from 'figma-api/lib/api-types';
import { FG_RED, RESET, UNDERLINE } from '@cobalt-ui/utils';
import path from 'path';
import undici from 'undici';

const SHARE_URL_RE = /^https:\/\/www\.figma\.com\/file\/([A-Za-z0-9]+)\//;
const FIGMA = {
  FILES: 'https://api.figma.com/v1/files/',
  IMAGES: 'https://api.figma.com/v1/images/',
};

interface Collection {
  components: Map<string, Figma.Node>;
  styles: Map<string, Figma.Node>;
}

/** collect all components within document */
export function collectStylesAndComponents(doc: GetFileResult, collection: Collection = { components: new Map(), styles: new Map() }): Collection {
  JSON.stringify(doc.document.children, (_, v) => {
    if (!v) return v;

    if (v.type === 'COMPONENT') {
      const componentName = doc.components[v.id].name;
      collection.components.set(componentName, v);
    } else if (v.styles) {
      for (const id of Object.values(v.styles)) {
        const styleName = doc.styles[id as string].name;
        collection.styles.set(styleName, v);
      }
    }

    return v;
  });

  return collection;
}

/** collect all deep node children as a flattened array (depth-first) */
export function collectChildren(node: Figma.Node, children: Figma.Node[] = []): Figma.Node[] {
  if (!Array.isArray((node as any).children) || !(node as any).children.length) return children;
  for (const c of children) {
    children.push(c);
    collectChildren(c, children);
  }
  return children;
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
export async function fetchFile(shareURL: string, componentID: string, filename: string): Promise<Buffer> {
  if (!process.env.FIGMA_API_KEY)
    throw new Error(
      `  ${FG_RED}✘  FIGMA_API_KEY not set. See ${UNDERLINE}https://www.figma.com/developers/api#access-tokens${RESET}${FG_RED} for instructions.${RESET}`
    );
  if (!SHARE_URL_RE.test(shareURL)) throw new Error(`  ${FG_RED}✘  Share URL must match ${UNDERLINE}https://www.figma.com/file/[id]${RESET}`);
  const id = (shareURL.match(SHARE_URL_RE) as RegExpMatchArray)[1];
  const search = new URLSearchParams({
    ids: componentID,
    format: path.extname(filename).replace(/^\./, ''),
  });

  // First, get download link from Figma
  const fileRes = await undici.request(`${FIGMA.IMAGES}${id}/?${search.toString()}`, {
    method: 'GET',
    headers: {
      'X-Figma-Token': process.env.FIGMA_API_KEY,
    },
  });
  if (fileRes.statusCode !== 200) throw new Error(await fileRes.body.text());
  const fileUrl = (await fileRes.body.json()).images[componentID];
  if (!fileUrl) throw new Error(`Could not fetch image for component ${componentID}"`);

  // Next, download data (don’t bother streaming to file because we may need to optimize)
  const fileData = await undici.request(fileUrl, { method: 'GET' });
  if (fileData.statusCode !== 200) throw new Error(await fileData.body.text());
  return new Buffer(Buffer.from(await fileData.body.arrayBuffer()));
}

export function padRight(input: string, width = 2): string {
  let output = input;
  while (output.length < width) {
    output += ' ';
  }
  return output;
}
