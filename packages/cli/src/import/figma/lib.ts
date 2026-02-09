import type {
  GetFileNodesResponse,
  GetFileResponse,
  GetFileStylesResponse,
  GetLocalVariablesResponse,
  GetPublishedVariablesResponse,
} from '@figma/rest-api-spec';
import type { Logger } from '@terrazzo/parser';
import { camelCase as sculeCamelCase } from 'scule';

export const KEY = ':key';
export const FILE_KEY = ':file_key';
export const API = {
  file: `https://api.figma.com/v1/files/${FILE_KEY}`,
  fileNodes: `https://api.figma.com/v1/files/${FILE_KEY}/nodes`,
  fileStyles: `https://api.figma.com/v1/files/${FILE_KEY}/styles`,
  localVariables: `https://api.figma.com/v1/files/${FILE_KEY}/variables/local`,
  publishedVariables: `https://api.figma.com/v1/files/${FILE_KEY}/variables/published`,
  styles: `https://api.figma.com/v1/styles/${KEY}`,
};

/** Wrapper around camelCase to handle more cases */
export function formatName(name: string): string {
  return sculeCamelCase(name.replace(/\s+/g, '-'));
}

const nf = new Intl.NumberFormat('en-us');

/** Wrapper around camelCase to handle more cases */
export function formatNumber(number: number): string {
  return nf.format(number);
}

/** Get File ID from design URL */
export function getFileID(url: string) {
  return url.match(/^https:\/\/(www\.)?figma\.com\/design\/([^/]+)/)?.[2];
}

/** /v1/files/:file_key */
export async function getFile(fileKey: string, { logger }: { logger: Logger }) {
  const res = await fetch(API.file.replace(FILE_KEY, fileKey), {
    method: 'GET',
    headers: { 'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN! },
  });
  if (!res.ok) {
    logger.error({ group: 'import', message: `${res.status} ${await res.text()}` });
  }
  return (await res.json()) as GetFileResponse;
}

/** /v1/files/:file_key/nodes */
export async function getFileNodes(fileKey: string, { ids, logger }: { logger: Logger; ids?: string[] }) {
  let url = API.fileNodes.replace(FILE_KEY, fileKey);
  if (ids?.length) {
    url += `?ids=${ids.join(',')}`;
  }
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN! },
  });
  if (!res.ok) {
    logger.error({ group: 'import', message: `${res.status} ${await res.text()}` });
  }
  return (await res.json()) as GetFileNodesResponse;
}

/** /v1/files/:file_key/styles */
export async function getFileStyles(fileKey: string, { logger }: { logger: Logger }) {
  const res = await fetch(API.fileStyles.replace(FILE_KEY, fileKey), {
    method: 'GET',
    headers: { 'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN! },
  });
  if (!res.ok) {
    logger.error({ group: 'import', message: `${res.status} ${await res.text()}` });
  }
  return (await res.json()) as GetFileStylesResponse;
}

/** /v1/files/:file_key/variables/local */
export async function getFileLocalVariables(fileKey: string, { logger }: { logger: Logger }) {
  const res = await fetch(API.localVariables.replace(FILE_KEY, fileKey), {
    method: 'GET',
    headers: { 'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN! },
  });
  if (!res.ok) {
    logger.error({ group: 'import', message: `${res.status} ${await res.text}` });
  }
  return (await res.json()) as GetLocalVariablesResponse;
}

/** /v1/files/:file_key/variables/published */
export async function getFilePublishedVariables(fileKey: string, { logger }: { logger: Logger }) {
  const res = await fetch(API.publishedVariables.replace(FILE_KEY, fileKey), {
    method: 'GET',
    headers: { 'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN! },
  });
  if (!res.ok) {
    logger.error({ group: 'import', message: `${res.status} ${await res.text}` });
  }
  return (await res.json()) as GetPublishedVariablesResponse;
}
