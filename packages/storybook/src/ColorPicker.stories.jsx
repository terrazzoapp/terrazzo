import ColorPicker from '@terrazzo/react-color-picker';
import useColor from '@terrazzo/use-color';

export default {
  title: 'Components/Form/ColorPicker',
  component: ColorPicker,
  parameters: {
    layout: 'centered',
  },
};

export const Overview = {
  args: {},
  render(args) {
    const [color, setColor] = useColor('rgb(33% 33% 100%/1)');
    return <ColorPicker {...args} color={color} setColor={setColor} />;
  },
};
