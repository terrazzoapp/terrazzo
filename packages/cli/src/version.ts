import fs from 'node:fs';

export function versionCmd() {
  const { version } = JSON.parse(
    fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
  );
  // oxlint-disable-next-line no-console
  console.log(version);
}
