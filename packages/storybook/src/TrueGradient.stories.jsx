import { TrueGradient } from '@terrazzo/react-color-picker';
import useColor from '@terrazzo/use-color';

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
    const [start] = useColor(args.start);
    const [end] = useColor(args.end);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        Good
        <TrueGradient start={start.oklab} end={end.oklab} style={{ width: '16rem', height: '1.5rem' }} />
        Bad
        <div
          style={{
            background: `linear-gradient(to right, ${start.css}, ${end.css})`,
            width: '16rem',
            height: '1.5rem',
          }}
        />
      </div>
    );
  },
};
