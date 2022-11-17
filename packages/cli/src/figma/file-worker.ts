import type {FigmaSettings} from '@cobalt-ui/core';
import type {Config} from 'svgo';
import fs from 'node:fs';
import path from 'node:path';
import svgo from 'svgo';
import {fetchFile} from './util.js';

interface SaveAndOptimizeOptions {
  url: string;
  componentID: string;
  filename: string;
  optimize?: FigmaSettings['optimize'];
}

export default async function saveAndOptimize({url, componentID, filename, optimize}: SaveAndOptimizeOptions): Promise<void> {
  const ext = path.extname(filename);
  let data = (await fetchFile(url, componentID, filename)).toString('utf8');
  if (optimize) {
    if ((optimize === true || optimize.svgo) && ext === '.svg') {
      const svgoOpts: Config | undefined = optimize && typeof optimize === 'object' && 'svgo' in optimize && optimize.svgo ? (optimize.svgo as Config) : undefined;
      data = svgo.optimize(data, svgoOpts).data;
    }
  }
  fs.mkdirSync(path.dirname(filename), {recursive: true});
  fs.writeFileSync(filename, data);
}
