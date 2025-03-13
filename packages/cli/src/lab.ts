import { createReadStream, createWriteStream, type PathLike } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import mime from 'mime';
import { serve } from "@hono/node-server"
import { ConfigInit } from '@terrazzo/parser';
import { Logger } from '@terrazzo/parser';
import { Flags } from './shared.js';
import { Writable, Readable } from 'node:stream';

export interface BuildOptions {
  flags: Flags;
  config: ConfigInit;
  configPath: string;
  logger: Logger;
}

export async function labCmd({ config, logger }: BuildOptions) {
  /**
   * it reads TOKEN if you squint your eyes all the way closed
   */
  const port = 9000;

  /** TODO: handle multiple files */
  const [ tokenFileUrl ] = config.tokens

  const staticFiles = new Set()
  const dirEntries = await readdir(fileURLToPath(import.meta.resolve("./lab")), {
    withFileTypes: true,
    recursive: true
  })
  for (const entry of dirEntries) {
    if (entry.isFile() == false) continue
    const absolutePath = entry.parentPath.replaceAll("\\", "/") + "/" + entry.name
    staticFiles.add(absolutePath.replace(fileURLToPath(import.meta.resolve("./lab")).replaceAll("\\", "/"), ""))
  }

  const server = serve({
    port,
    overrideGlobalObjects: false,
    async fetch(request) {
      const url = new URL(request.url);
      const pathname = url.pathname;
      if (pathname === '/') {
        return new Response(Readable.toWeb(createReadStream(fileURLToPath(import.meta.resolve("./lab/index.html")))) as ReadableStream, {
          headers: {
            "Content-Type": "text/html"
          }
        })
      }
      if (pathname === '/api/tokens') {
        if (request.method === 'GET') {
          return new Response(Readable.toWeb(createReadStream(tokenFileUrl as PathLike)) as any, {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          });
        } else if (request.method === 'POST' && request.body) {
          await request.body.pipeTo(Writable.toWeb(createWriteStream(tokenFileUrl as PathLike)));
          return new Response(JSON.stringify({ success: true }), {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }
      }

      if (staticFiles.has(pathname)) {
        return new Response(Readable.toWeb(createReadStream(fileURLToPath(import.meta.resolve("./lab" + pathname)))) as ReadableStream, {
          headers: { 'Content-Type': mime.getType(pathname) ?? "application/octet-stream" }
        });
      }
      return new Response('Not found', { status: 404 });
    }
  }, (info) => {
    logger.info({ group: 'lab', message: `Server running at http://${info.address === "::" ? "localhost" : info.address}:${info.port}` });
  });
  /**
   * The cli entrypoint is going to manually exit the process after labCmd returns.
   */
  await new Promise<void>((resolve, reject) => {
    server.on("close", resolve)
    server.on("error", reject)
  })
}
