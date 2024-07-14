import { Demo, Slider } from '@terrazzo/tiles';
import { useState } from 'react';

export default function ColorPickerDemo() {
  const [value, setValue] = useState(50);

  return (
    <Demo
      code={
        /* tsx */ `import { Slider } from '@terrazzo/tiles';

export default function MyComponent() {
  const [value, setValue] = useState(50);

  return (
    <Slider label='My Slider' value={value} onChange={setValue} min={0} max={100} step={0.1} />
  );
}`
      }
    >
      <Slider label='My Slider' value={value} onChange={setValue} min={0} max={100} step={1} />
    </Demo>
  );
}
