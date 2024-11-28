import fs from 'node:fs';

export function versionCmd() {
  const { version } = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  console.log(version);
}
