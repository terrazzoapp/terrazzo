import type { TokenManifest } from './validate';

import fs from 'fs';
import yaml from 'js-yaml';

/** Load a tokens.yaml file from a URL */
export default function load(filePath: URL): TokenManifest {
  const src = fs.readFileSync(filePath, 'utf8');
  return yaml.load(src) as TokenManifest;
}
