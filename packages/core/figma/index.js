import { FG_RED, RESET, UNDERLINE } from "@cobalt-ui/utils";
import undici from "undici";

const FIGMA = {
  FILES: "https://api.figma.com/v1/files/",
  IMAGES: "https://api.figma.com/v1/images/",
};
const SHARE_URL_RE = /^https:\/\/www\.figma\.com\/file\/([A-Za-z0-9]+)\//;


/**
 * Get Figma document
 * @param {string} shareURL
 */
export async function fetchDoc(shareURL) {
  if (!process.env.FIGMA_API_KEY)
    throw new Error(`  ${FG_RED}✘  FIGMA_API_KEY not set. See ${UNDERLINE}https://www.figma.com/developers/api#access-tokens${RESET}${FG_RED} for instructions.${RESET}`);
  if (!SHARE_URL_RE.test(shareURL)) throw new Error(`  ${FG_RED}✘  Share URL must match ${UNDERLINE}https://www.figma.com/file/[id]${RESET}`);
  const id = shareURL.match(SHARE_URL_RE)[1];
  const res = await undici.request(`${FIGMA.FILES}${id}`, {
    method: "GET",
    headers: {
      "X-Figma-Token": process.env.FIGMA_API_KEY,
    },
  });
  if (res.statusCode != 200) throw new Error(await res.body.text());
  return await res.body.text(); // note: don’t parse JSON as it will be handed off to Rust
}

/** export file from Figma */
export async function fetchImg(id, componentID, format) {
  if (!process.env.FIGMA_API_KEY)
    throw new Error(`  ${FG_RED}✘  FIGMA_API_KEY not set. See ${UNDERLINE}https://www.figma.com/developers/api#access-tokens${RESET}${FG_RED} for instructions.${RESET}`);
  const search = new URLSearchParams({
    ids: componentID,
    format: format,
  });

  // First, get download link from Figma
  const imgRes = await undici.request(`${FIGMA.IMAGES}${id}/?${search.toString()}`, {
    method: "GET",
    headers: {
      "X-Figma-Token": process.env.FIGMA_API_KEY,
    },
  });
  if (!imgRes.statusCode != 200) throw new Error(await imgRes.body.text());
  const imgUrl = (await imgRes.body.json()).images[componentID];
  if (!imgUrl) throw new Error(`Could not fetch image for component ${componentID}"`);

  // Next, download data (using streaming for best results)
  return new Promise((resolve, reject) => {
    const req = undici.pipeline(imgUrl, { method: "GET" }, (res) => {
      if (res.statusCode !== 200) {
        reject(`${res.statusCode}`);
        return;
      }
      let data = [];
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
