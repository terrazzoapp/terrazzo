import { Select, SelectItem } from '@terrazzo/tiles';

export default function VersionSwitcher() {
  const value = globalThis.location && globalThis.location.pathname.includes('/2.0/') ? '2' : '0';

  return (
    <Select
      value={value}
      onValueChange={(newValue) => {
        if (newValue === value) {
          return;
        }
        if (newValue === '2') {
          globalThis.location.href = globalThis.location.href.replace(/\/docs\/?/, '/docs/2.0/');
        } else {
          globalThis.location.href = globalThis.location.href.replace(/\/docs\/[\d.]+\/?/, '/docs/');
        }
      }}
      aria-label='Version'
    >
      <SelectItem value='0'>Latest</SelectItem>
      <SelectItem value='2'>2.0 beta</SelectItem>
    </Select>
  );
}
