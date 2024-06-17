import ColorPicker from '@terrazzo/react-color-picker';
import useColor from '@terrazzo/use-color';

export default function ColorPickerDemo() {
  const [color, setColor] = useColor('#663399');

  return <ColorPicker color={color} setColor={setColor} />;
}
