import { Select, SelectItem } from '@terrazzo/tiles';

export default function VersionSwitcher() {
  const value = globalThis.location?.pathname.includes('/0.x/') ? '0' : '2';

  return (
    <Select
      value={value}
      onValueChange={(newValue) => {
        if (newValue === value) {
          return;
        }
        if (newValue === '2') {
          globalThis.location.href = globalThis.location.href.replace(/\/docs\/0\.x\/?/, '/docs/');
        } else {
          globalThis.location.href = globalThis.location.href.replace(/\/docs\/?/, '/docs/0.x/');
        }
      }}
      aria-label='Version'
    >
      <SelectItem value='2'>Latest</SelectItem>
      <SelectItem value='0'>0.x beta</SelectItem>
    </Select>
  );
}
