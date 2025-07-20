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
    const [color, setColor] = useColor('color(srgb 1 0 0)');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '15rem' }}>
        {Object.keys(color.original).map((channel) => {
          if (channel === 'mode') {
            return null;
          }
          return (
            <ColorChannelSlider
              key={`${color.original.mode}-${channel}`}
              color={color}
              channel={channel}
              setColor={setColor}
            />
          );
        })}
      </div>
    );
  },
};

export const oklch = {
  render() {
    const [color, setColor] = useColor('oklch(0.7 0.2 150)');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '15rem' }}>
        {Object.keys(color.original).map((channel) => {
          if (channel === 'mode') {
            return null;
          }
          return (
            <ColorChannelSlider
              key={`${color.original.mode}-${channel}`}
              color={color}
              channel={channel}
              setColor={setColor}
            />
          );
        })}
      </div>
    );
  },
};
