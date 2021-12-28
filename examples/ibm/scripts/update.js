import colors from "@carbon/colors";
import icons from "@carbon/icons";
import typography from "@carbon/type";
import fs from "fs";
import yaml from "js-yaml";

const TEXT_RE = /^[A-Z]+/i;
const tokensPath = new URL("../tokens.yaml", import.meta.url);
const schema = yaml.load(fs.readFileSync(tokensPath));

// colors
const colorUpdates = [];
for (const [colorName, value] of Object.entries(colors)) {
  if (typeof value != "string") continue;
  colorUpdates.push([colorName, value]);
}
colorUpdates.sort((a, b) => {
  // sort "-Hover" colors to back
  if (a[0].match(TEXT_RE)[0] == b[0].match(TEXT_RE)[0]) {
    if (a[0].endsWith("Hover") && !b[0].endsWith("Hover")) return 1;
    if (!a[0].endsWith("Hover") && b[0].endsWith("Hover")) return -1;
  }
  return a[0].localeCompare(b[0], "en-us", { numeric: true });
});
for (const [colorName, value] of colorUpdates) {
  schema.tokens.color[colorName] = { type: "color", value };
}

// icons (note: there is an svg/ folder inside @carbon/icons but it’s missing many from this array)
for (const icon of Object.values(icons)) {
  if (icon.elem != "svg") continue;
  const h = icon.attrs.height; // note: this is the only attr
  let code = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${h} ${h}">${toHTML(icon.content)}</svg>`;
  fs.writeFileSync(new URL(`../icon/${icon.name}.svg`, import.meta.url), code);
  schema.tokens.icon[icon.name] = { type: "file", value: `./icon/${icon.name}.svg` };
}

// typography
for (const [fontName, value] of Object.entries(typography)) {
  // family
  if (fontName == "fontFamilies") {
    for (const [familyName, fontStack] of Object.entries(value)) {
      schema.tokens.font.family[familyName] = { type: "font", value: fontStack.split(",").map((v) => v.trim().replace(/^'/, "").replace(/'$/, "")) };
    }
    continue;
  }
  // size
  if (typeof value == "object" && value.fontSize) {
    schema.tokens.font.size[fontName] = { type: "dimension", value: value.fontSize };
  }
}

// motion (updated manually)

// FINISH
fs.writeFileSync(tokensPath, yaml.dump(schema));

// utils
function toHTML(el) {
  let code = "";
  if (Array.isArray(el)) {
    for (const child of el) {
      code += toHTML(child);
    }
  } else {
    code += `<${el.elem}`;
    if (el.attrs && Object.keys(el.attrs).length) {
      code += ` ${Object.entries(el.attrs)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ")}`;
    }
    code += `/>`;
  }
  return code;
}
