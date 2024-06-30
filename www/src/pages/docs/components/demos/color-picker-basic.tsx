import ColorPicker from '@terrazzo/react-color-picker';
import { Demo } from '@terrazzo/tiles';
import useColor from '@terrazzo/use-color';

export default function ColorPickerDemo() {
  const [color, setColor] = useColor('#663399');

  return (
    <Demo
      code={
        /* tsx */ `import ColorPicker from '@terrazzo/react-color-picker';
import { Demo } from '@terrazzo/tiles';
import useColor from '@terrazzo/use-color';

export default function MyComponent() {
  const [color, setColor] = useColor('#663399');

  return (
    <ColorPicker color={color} setColor={setColor} />
  );
}`
      }
    >
      <div style={{ marginInline: 'auto', width: '15rem' }}>
        <ColorPicker color={color} setColor={setColor} />
      </div>
    </Demo>
  );
}
