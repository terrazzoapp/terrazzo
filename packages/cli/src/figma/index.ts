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
    Object.entries(config.figma).map(async ([shareURL, mappings]) => {
      const fileMatch = shareURL.match(/\/file\/([^/]+)/);
      if (!fileMatch) throw new Error(`Bad Figma URL: "${shareURL}". Please use URL from "Share" > "Copy Link"`);
      const docID = fileMatch[1];
      const doc = await fetchDoc(docID);

      // console.log(JSON.stringify(doc, undefined, 2));

      const components = collectComponents(doc.document);
      for (const [figmaName, { type, id }] of Object.entries(mappings)) {
        const component = components.get(figmaName);
        if (!component) throw new Error(`Could not find component "${figmaName}". It must be named this exactly. If using shared components, please use the URL of the file that component is defined in.\n  "${shareURL}"`);
        if (!tokenUpdates[id]) tokenUpdates[id] = { type: type as any, value: "" } as TokenNode;

        switch (type) {
          case "color": {
            const [fill] = collectFills(component);
            if (!fill) throw new Error(`Could not find fill on component "${figmaName}"`);

            let value: string | undefined;
            // gradient
            if (fill.type === "GRADIENT_ANGULAR" || fill.type === "GRADIENT_DIAMOND" || fill.type == "GRADIENT_LINEAR" || fill.type == "GRADIENT_RADIAL") {
              value = gradientToCSS(fill);
            }
            // color
            else if (fill.color) {
              value = colorToHex(fill.color);
            }
            if (!value) throw new Error(`Could not read fill on component "${figmaName}"`);
            tokenUpdates[id].value = value;
            break;
          }
          case "file": {
            if (typeof modes !== "string") throw new Error(`Invalid filename: "${modes}"`);
            const filePath = modes.replace(/^[/\\]/, "");
            tokenUpdates[id].type = "file";
            const format = path.extname(filePath).replace(/^\./, "");

            // show progress
            if (fileDone == 0) console.log(""); // eslint-disable-line no-console
            const progressBar = new Array(Math.floor(10 * (fileDone / totalFiles)) + 1).join("\u2588");
            const progressBg = new Array(9 - Math.floor(10 * (fileDone / totalFiles))).join("\u2591");
            process.stdout.write(`\r  Updating files…    ${progressBar}${progressBg}  [${padRight(`${fileDone}`, `${totalFiles}`.length)} / ${totalFiles}]   `);
            const imgData = await fetchImg(docID, component.id, format);
            fileDone++;
            process.stdout.write(`\r  Updating files…    ${progressBar}${progressBg}   [${padRight(`${fileDone}`, `${totalFiles}`.length)} / ${totalFiles}]   `);
            if (fileDone == totalFiles) process.stdout.write("\r                              \r");

            // write file
            const fileURL = new URL(filePath, `file://${process.cwd()}/`);
            fs.mkdirSync(new URL("./", fileURL), { recursive: true });
            fs.writeFileSync(fileURL, imgData);

            // update tokens.yaml
            tokenUpdates[id].value.default = filePath;
            break;
          }
          case "fontFamily": {
            break;
          }
          case "fontSize": {
            break;
          }
          case "fontStyle": {
            break;
          }
          case "fontWeight": {
            break;
          }
          case "stroke": {
            const [stroke] = collectStrokes(component);
            if (!stroke) throw new Error(`Could not find stroke on component "${figmaName}"`);

            let value: string | undefined;
            if (stroke.strokes[0] && stroke.strokes[0].color) {
              value = colorToHex(stroke.strokes[0].color);
            }

            if (!value) throw new Error(`Could not read stroke on component "${figmaName}"`);

            if (Array.isArray(modes)) {
              for (const mode of modes) {
                tokenUpdates[id].value[mode] = value;
              }
            } else if (typeof modes === "string") {
              tokenUpdates[id].value[modes] = value;
            } else {
              tokenUpdates[id].value.default = value;
            }
            break;
          }
          default: {
            console.warn(`Unknown property "${property}" (it may not be implemented yet)`); // eslint-disable-line no-console
          }
        }
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
