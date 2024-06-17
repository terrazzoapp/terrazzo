import { TrueGradient } from '@terrazzo/react-color-picker';
import { modeP3, modeRgb, useMode } from 'culori/fn';

const toRgb = useMode(modeRgb);
useMode(modeP3);

export default {
  title: 'Components/Display/TrueGradient',
  component: TrueGradient,
  parameters: {
    layout: 'centered',
  },
};

export const Overview = {
  args: {
    start: 'color(srgb 1 0 0)',
    end: 'color(srgb 0 1 0)',
  },
  render(args) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        Good
        <TrueGradient start={toRgb(args.start)} end={toRgb(args.end)} style={{ width: '16rem', height: '1.5rem' }} />
        Bad
        <div
          style={{
            background: `linear-gradient(to right, ${args.start}, ${args.end})`,
            width: '16rem',
            height: '1.5rem',
          }}
        />
      </div>
    );
  },
};
