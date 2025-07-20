import { HueWheel } from '@terrazzo/react-color-picker';

/** @type {import("@storybook/react-vite").Meta} */
export default {
  title: 'Components/Display/HueWheel',
  component: HueWheel,
  parameters: {
    layout: 'centered',
  },
};

const MEDIUM_GRADIENT = [
  'oklch(0.6477 0.26260   0.0)',
  'oklch(0.6381 0.25165  15.0)',
  'oklch(0.6325 0.25300  30.0)',
  'oklch(0.6994 0.20000  45.0)',
  'oklch(0.7528 0.17600  60.0)',
  'oklch(0.8089 0.16900  75.0)',
  'oklch(0.8623 0.17600  90.0)',
  'oklch(0.8992 0.19055 105.0)',
  'oklch(0.9395 0.22313 120.0)',
  'oklch(0.8805 0.25696 135.0)',
  'oklch(0.8740 0.24094 150.0)',
  'oklch(0.8882 0.18186 165.0)',
  'oklch(0.8971 0.16000 180.0)',
  'oklch(0.9027 0.15400 195.0)',
  'oklch(0.8418 0.14553 210.0)',
  'oklch(0.7842 0.14653 225.0)',
  'oklch(0.6790 0.15500 240.0)',
  'oklch(0.6260 0.20480 255.0)',
  'oklch(0.5997 0.21694 270.0)',
  'oklch(0.5995 0.22783 285.0)',
  'oklch(0.6004 0.25786 300.0)',
  'oklch(0.6233 0.30183 315.0)',
  'oklch(0.7000 0.30000 330.0)',
  'oklch(0.6646 0.28266 345.0)',
  'oklch(0.6477 0.26260 360.0)',
];

const BAD_GRADIENT = [];
const rgb = [1, 0, 0];
for (let i = 0; i < rgb.length; i++) {
  // this is heinous but sidestepps JS rediculous rounding errors and makes colors easier to debug
  for (const add of [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]) {
    const channel = (i + 1) % 3;
    rgb[channel] = add;
    BAD_GRADIENT.push(`color(srgb ${rgb.join(' ')})`);
  }
  for (const minus of [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]) {
    rgb[i % 3] = minus;
    BAD_GRADIENT.push(`color(srgb ${rgb.join(' ')})`);
  }
}

export const Overview = {
  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        Good
        <HueWheel style={{ width: '16rem', height: '1.5rem' }} />
        Medium
        <div
          style={{
            background: `linear-gradient(to right, ${MEDIUM_GRADIENT.join(', ')})`,
            width: '16rem',
            height: '1.5rem',
          }}
        />
        Bad
        <div
          style={{
            background: `linear-gradient(to right, ${BAD_GRADIENT.join(', ')})`,
            width: '16rem',
            height: '1.5rem',
          }}
        />
      </div>
    );
  },
};
