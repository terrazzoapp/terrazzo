import type { FigmaSettings } from '@cobalt-ui/core';
import type { OptimizeOptions } from 'svgo';
import fs from 'fs';
import path from 'path';
import svgo from 'svgo';
import { fetchFile } from './util.js';

interface SaveAndOptimizeOptions {
  url: string;
  componentID: string;
  filename: string;
  optimize?: FigmaSettings['optimize'];
}

export default async function saveAndOptimize({ url, componentID, filename, optimize }: SaveAndOptimizeOptions): Promise<void> {
  const ext = path.extname(filename);
  let data = await fetchFile(url, componentID, filename);
  if (optimize) {
    if ((optimize === true || optimize.svgo) && ext === '.svg') {
      const svgoOpts: OptimizeOptions = typeof optimize === 'object' && typeof optimize.svgo === 'object' ? (optimize as any).svgo : undefined;
      data = (svgo.optimize(data, svgoOpts) as any).data;
    }
  }
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, data);
}
