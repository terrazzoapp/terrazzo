import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import { Readable, Writable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import type { ConfigInit, Logger } from '@terrazzo/parser';
import mime from 'mime';
import type { Flags } from './shared.js';

export interface LabBuildOptions {
  flags: Flags;
  config: ConfigInit;
  configPath: string;
  logger: Logger;
}

export async function labCmd({ config, logger }: LabBuildOptions) {
  /** TODO: handle multiple files */
  const [tokenFileUrl] = config.tokens;

  const staticFiles = new Set();
  const dirEntries = await fs.readdir(fileURLToPath(import.meta.resolve('./lab')), {
    withFileTypes: true,
    recursive: true,
  });
  for (const entry of dirEntries) {
    if (entry.isFile() === false) {
      continue;
    }
    const absolutePath = `${entry.parentPath.replaceAll('\\', '/')}/${entry.name}`;
    staticFiles.add(absolutePath.replace(fileURLToPath(import.meta.resolve('./lab')).replaceAll('\\', '/'), ''));
  }

  const server = serve(
    {
      port: 9000,
      overrideGlobalObjects: false,
      async fetch(request) {
        const url = new URL(request.url);
        const pathname = url.pathname;
        if (pathname === '/') {
          return new Response(
            Readable.toWeb(
              fsSync.createReadStream(fileURLToPath(import.meta.resolve('./lab/index.html'))),
            ) as ReadableStream,
            {
              headers: {
                'Content-Type': 'text/html',
              },
            },
          );
        }
        if (pathname === '/api/tokens') {
          if (request.method === 'GET') {
            return new Response(
              Readable.toWeb(fsSync.createReadStream(tokenFileUrl as fsSync.PathLike)) as ReadableStream,
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-cache',
                },
              },
            );
          } else if (request.method === 'POST' && request.body) {
            await request.body.pipeTo(Writable.toWeb(fsSync.createWriteStream(tokenFileUrl as fsSync.PathLike)));
            return new Response(JSON.stringify({ success: true }), {
              headers: {
                'Content-Type': 'application/json',
              },
            });
          }
        }

        if (staticFiles.has(pathname)) {
          return new Response(
            Readable.toWeb(
              fsSync.createReadStream(fileURLToPath(import.meta.resolve(`./lab${pathname}`))),
            ) as ReadableStream,
            {
              headers: { 'Content-Type': mime.getType(pathname) ?? 'application/octet-stream' },
            },
          );
        }
        return new Response('Not found', { status: 404 });
      },
    },
    (info) => {
      logger.info({
        group: 'server',
        message: `Token Lab running at http://${info.address === '::' ? 'localhost' : info.address}:${info.port}`,
      });
    },
  );
  /**
   * The cli entrypoint is going to manually exit the process after labCmd returns.
   */
  await new Promise<void>((resolve, reject) => {
    server.on('close', resolve);
    server.on('error', reject);
  });
}
