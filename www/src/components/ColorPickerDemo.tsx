import ColorPicker from '@terrazzo/react-color-picker';
import useColor from '@terrazzo/use-color';

export default function ColorPickerDemo() {
  const [color, setColor] = useColor('#663399');

  return (
    <div style={{ marginInline: 'auto', width: '15rem' }}>
      <ColorPicker color={color} setColor={setColor} />
    </div>
  );
}
