import type Figma from "figma-js";

import https from "https";
import fetch from "node-fetch";

const FIGMA_API = `https://api.figma.com/`;

/** collect all components within document */
export function collectComponents(node: Figma.Node, components = new Map<string, Figma.Component>()):  Map<string, Figma.Component> {
  if (node.type == "COMPONENT") {
    if (components.has(node.name)) {
      console.warn(`Duplicate component name found "${node.name}". Tokens may not generate as expected.`); // eslint-disable-line no-console
    } else {
      components.set(node.name, node);
    }
    return components;
  }

  const { children } = node as Figma.Group;
  if (!Array.isArray(children) || !children.length) return components;

  for (const child of children) {
    collectComponents(child, components);
  }

  return components;
}

/** collect all styles within document */
export function collectStyles(node: Figma.Node, styles = new Map<string, Figma.()):  Map<string, Figma.Component> {
}

/** collect fills from node */
export function collectFills(node: Figma.Node, allFills: Figma.Paint[] = []): Figma.Paint[] {
  const { fills, children } = node as Figma.FrameBase;
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
  strokes: Figma.FrameBase["strokes"];
  strokeWeight: Figma.FrameBase["strokeWeight"];
  strokeAlign: Figma.FrameBase["strokeAlign"];
}

/** collect fills from node */
export function collectStrokes(node: Figma.Node, allStrokes: StrokeGroup[] = []): StrokeGroup[] {
  const { children, strokes, strokeWeight, strokeAlign } = node as Figma.FrameBase;
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

/** get Figma document */
export async function fetchDoc(id: string): Promise<Figma.FileResponse> {
  const { FIGMA_API_KEY } = process.env;
  if (!FIGMA_API_KEY) throw new Error(`FIGMA_API_KEY not set. See https://www.figma.com/developers/api#access-tokens for instructions.`);
  return fetch(new URL(`/v1/files/${id}`, FIGMA_API).href, {
    method: "GET",
    headers: {
      "X-Figma-Token": FIGMA_API_KEY,
    },
  }).then((res) => res.json()) as any;
}

/** export file from Figma */
export async function fetchImg(id: string, componentID: string, format: string): Promise<Buffer> {
  const { FIGMA_API_KEY } = process.env;
  if (!FIGMA_API_KEY) throw new Error(`FIGMA_API_KEY not set. See https://www.figma.com/developers/api#access-tokens for instructions.`);
  const search = new URLSearchParams({
    ids: componentID,
    format: format,
  });

  // First, get download link from Figma
  const imgUrl = (
    (await fetch(new URL(`/v1/images/${id}/?${search.toString()}`, FIGMA_API).href, {
      method: "GET",
      headers: {
        "X-Figma-Token": FIGMA_API_KEY,
      },
    }).then((res) => res.json())) as Figma.FileImageResponse
  ).images[componentID];
  if (!imgUrl) throw new Error(`Could not fetch image for component ${componentID}"`);

  // Next, download data
  return new Promise<Buffer>((resolve, reject) => {
    const req = https.request(imgUrl, { method: "GET" }, (res) => {
      if (res.statusCode !== 200) {
        reject(`${res.statusCode}`);
        return;
      }

      let data: any[] = [];
      res.on("data", (chunk) => {
        data.push(chunk);
      });
      res.on("end", () => {
        resolve(Buffer.concat(data));
      });
    });
    req.on("error", (err) => {
      reject(err);
    });
    req.end();
  });
}
