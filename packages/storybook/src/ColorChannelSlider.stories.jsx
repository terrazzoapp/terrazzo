import { ColorChannelSlider } from '@terrazzo/react-color-picker';
import useColor from '@terrazzo/use-color';

export default {
  title: 'Components/Form/ColorChannelSlider',
  component: ColorChannelSlider,
  parameters: {
    layout: 'centered',
  },
};

export const srgb = {
  render() {
    const [color, setColor] = useColor('rgb(100% 0% 0%)');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '15rem' }}>
        {Object.keys(color.original.space.coords).map((channel) => (
          <ColorChannelSlider key={channel} color={color} channel={channel} setColor={setColor} />
        ))}
      </div>
    );
  },
};

export const oklch = {
  render() {
    const [color, setColor] = useColor('oklch(70% 0.2 150)');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '15rem' }}>
        {Object.keys(color.original.space.coords).map((channel) => (
          <ColorChannelSlider key={channel} color={color} channel={channel} setColor={setColor} />
        ))}
      </div>
    );
  },
};
