import type { Config, TokenNode } from "@cobalt-ui/core";
import fs from "fs";
import path from "path";
import { colorToHex, gradientToCSS } from "./paint.js";
import { collectComponents, collectFills, collectStrokes, fetchDoc, fetchImg } from "./utils.js";

async function load(config: Config): Promise<Record<string, TokenNode>> {
  if (!config.figma) throw new Error(`"figma" missing in cobalt.config.mjs (see https://cobalt-ui.pages.dev)`);
  if (!Object.keys(config.figma).length) throw new Error(`No Figma files found in cobalt.config.mjs`);

  const tokenUpdates: Record<string, TokenNode> = {};

  let totalFiles = 0;
  for (const doc of Object.values(config.figma)) {
    for (const token of Object.values(doc)) {
      if (token.file) totalFiles++;
    }
  }

  let fileDone = 0;

  await Promise.all(
    Object.entries(config.figma).map(async ([shareURL, { components = {}, styles = {} }]) => {
      const fileMatch = shareURL.match(/\/file\/([^/]+)/);
      if (!fileMatch) throw new Error(`Bad Figma URL: "${shareURL}". Please use URL from "Share" > "Copy Link"`);
      const docID = fileMatch[1];
      const doc = await fetchDoc(docID);

      console.log(JSON.stringify(doc, undefined, 2));

      for (const style of Object.entries(styles)) {
      }
    })
  );

  return tokenUpdates;
}

export default load;

function padRight(input: string, width = 2): string {
  let output = input;
  while (output.length < width) {
    output += " ";
  }
  return output;
}
