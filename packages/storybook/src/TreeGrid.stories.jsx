import { TreeGrid } from '@terrazzo/tiles';

export default {
  title: 'Components/TreeGrid',
  component: TreeGrid,
  parameters: {
    layout: 'fullscreen',
  },
};

function DTCGTree({ path = [], data }) {
  if (!data || typeof data !== 'object') {
    return null;
  }
  return Object.entries(data).map(([k, v]) => {
    if (!v || typeof v !== 'object') {
      return null;
    }
    const id = path.length ? `token-${path.join('-')}-${k}` : `token-${k}`;
    if (v.$value) {
      return <TreeGrid.Item key={k} id={id} name={k} />;
    }
    return (
      <TreeGrid.Group key={k} id={id} name={k}>
        <DTCGTree data={v} path={[...path, k]} />
      </TreeGrid.Group>
    );
  });
}

export const Overview = {
  args: {},
  layout: 'left',
  render(args) {
    return (
      <div style={{ width: 'max-content' }}>
        <TreeGrid.Root {...args}>
          <DTCGTree data={SDS} />
        </TreeGrid.Root>
      </div>
    );
  },
};

const SDS = {
  color: {
    $type: 'color',
    black: {
      100: { $value: '#0c0c0d0d' },
      200: { $value: '#0c0c0d1a' },
      300: { $value: '#0c0c0d33' },
      400: { $value: '#0c0c0d66' },
      500: { $value: '#0c0c0db2' },
      600: { $value: '#0c0c0dcc' },
      700: { $value: '#0c0c0dd9' },
      800: { $value: '#0c0c0de5' },
      900: { $value: '#0c0c0df2' },
      1000: { $value: '#0c0c0d' },
    },
    brand: {
      100: { $value: '#f5f5f5' },
      200: { $value: '#e6e6e6' },
      300: { $value: '#d9d9d9' },
      400: { $value: '#b3b3b3' },
      500: { $value: '#757575' },
      600: { $value: '#444444' },
      700: { $value: '#383838' },
      800: { $value: '#2c2c2c' },
      900: { $value: '#1e1e1e' },
      1000: { $value: '#111111' },
    },
    gray: {
      100: { $value: '#f5f5f5' },
      200: { $value: '#e6e6e6' },
      300: { $value: '#d9d9d9' },
      400: { $value: '#b3b3b3' },
      500: { $value: '#757575' },
      600: { $value: '#444444' },
      700: { $value: '#383838' },
      800: { $value: '#2c2c2c' },
      900: { $value: '#1e1e1e' },
      1000: { $value: '#111111' },
    },
    green: {
      100: { $value: '#ebffee' },
      200: { $value: '#cff7d3' },
      300: { $value: '#aff4c6' },
      400: { $value: '#85e0a3' },
      500: { $value: '#14ae5c' },
      600: { $value: '#009951' },
      700: { $value: '#008043' },
      800: { $value: '#02542d' },
      900: { $value: '#024023' },
      1000: { $value: '#062d1b' },
    },
    pink: {
      100: { $value: '#fcf1fd' },
      200: { $value: '#fae1fa' },
      300: { $value: '#f5c0ef' },
      400: { $value: '#f19edc' },
      500: { $value: '#ea3fb8' },
      600: { $value: '#d732a8' },
      700: { $value: '#ba2a92' },
      800: { $value: '#8a226f' },
      900: { $value: '#57184a' },
      1000: { $value: '#3f1536' },
    },
    red: {
      100: { $value: '#fee9e7' },
      200: { $value: '#fdd3d0' },
      300: { $value: '#fcb3ad' },
      400: { $value: '#f4776a' },
      500: { $value: '#ec221f' },
      600: { $value: '#c00f0c' },
      700: { $value: '#900b09' },
      800: { $value: '#690807' },
      900: { $value: '#4d0b0a' },
      1000: { $value: '#300603' },
    },
    slate: {
      100: { $value: '#f3f3f3' },
      200: { $value: '#e3e3e3' },
      300: { $value: '#cdcdcd' },
      400: { $value: '#b2b2b2' },
      500: { $value: '#949494' },
      600: { $value: '#767676' },
      700: { $value: '#5a5a5a' },
      800: { $value: '#434343' },
      900: { $value: '#303030' },
      1000: { $value: '#242424' },
    },
    white: {
      100: { $value: '#ffffff0d' },
      200: { $value: '#ffffff1a' },
      300: { $value: '#ffffff33' },
      400: { $value: '#ffffff66' },
      500: { $value: '#ffffffb2' },
      600: { $value: '#ffffffcc' },
      700: { $value: '#ffffffd9' },
      800: { $value: '#ffffffe5' },
      900: { $value: '#fffffff2' },
      1000: { $value: '#ffffff' },
    },
    yellow: {
      100: { $value: '#fffbeb' },
      200: { $value: '#fff1c2' },
      300: { $value: '#ffe8a3' },
      400: { $value: '#e8b931' },
      500: { $value: '#e5a000' },
      600: { $value: '#bf6a02' },
      700: { $value: '#975102' },
      800: { $value: '#682d03' },
      900: { $value: '#522504' },
      1000: { $value: '#401b01' },
    },
    background: {
      brand: {
        default: { $value: '{color.brand.800}' },
        hover: { $value: '{color.brand.900}' },
        secondary: { $value: '{color.brand.200}' },
        'secondary-hover': { $value: '{color.brand.300}' },
        tertiary: { $value: '{color.brand.100}' },
        'tertiary-hover': { $value: '{color.brand.200}' },
      },
      danger: {
        default: { $value: '{color.red.500}' },
        hover: { $value: '{color.red.600}' },
        secondary: { $value: '{color.red.200}' },
        'secondary-hover': { $value: '{color.red.300}' },
        tertiary: { $value: '{color.red.100}' },
        'tertiary-hover': { $value: '{color.red.200}' },
      },
      default: {
        default: { $value: '{color.white.1000}' },
        hover: { $value: '{color.gray.100}' },
        secondary: { $value: '{color.gray.100}' },
        'secondary-hover': { $value: '{color.gray.200}' },
        tertiary: { $value: '{color.gray.300}' },
        'tertiary-hover': { $value: '{color.gray.400}' },
      },
      disabled: {
        default: { $value: '{color.brand.300}' },
      },
      neutral: {
        default: { $value: '{color.slate.700}' },
        hover: { $value: '{color.slate.800}' },
        secondary: { $value: '{color.slate.300}' },
        'secondary-hover': { $value: '{color.slate.400}' },
        tertiary: { $value: '{color.slate.200}' },
        'tertiary-hover': { $value: '{color.slate.300}' },
      },
      positive: {
        default: { $value: '{color.green.500}' },
        hover: { $value: '{color.green.600}' },
        secondary: { $value: '{color.green.200}' },
        'secondary-hover': { $value: '{color.green.300}' },
        tertiary: { $value: '{color.green.100}' },
        'tertiary-hover': { $value: '{color.green.200}' },
      },
      utilities: {
        blanket: { $value: '#000000b2' },
        measurement: { $value: '{color.pink.200}' },
        overlay: { $value: '#00000080' },
        scrim: { $value: '#ffffffcc' },
      },
      warning: {
        default: { $value: '{color.yellow.400}' },
        hover: { $value: '{color.yellow.500}' },
        secondary: { $value: '{color.yellow.200}' },
        'secondary-hover': { $value: '{color.yellow.300}' },
        tertiary: { $value: '{color.yellow.100}' },
        'tertiary-hover': { $value: '{color.yellow.200}' },
      },
    },
  },
  size: {
    $type: 'dimension',
    blur: {
      100: { $value: '0.25rem' },
    },
    depth: {
      0: { $value: '0rem' },
      '025': { $value: '0.0625rem' },
      100: { $value: '0.25rem' },
      200: { $value: '0.5rem' },
      400: { $value: '1rem' },
      800: { $value: '2rem' },
      1200: { $value: '3rem' },
      'negative-025': { $value: '-0.0625rem' },
      'negative-100': { $value: '-0.25rem' },
      'negative-200': { $value: '-0.5rem' },
      'negative-400': { $value: '-1rem' },
      'negative-800': { $value: '-2rem' },
      'negative-1200': { $value: '-3rem' },
    },
    icon: {
      small: { $value: '1.5rem' },
      medium: { $value: '2rem' },
      large: { $value: '2.5rem' },
    },
    radius: {
      100: { $value: '0.25rem' },
      200: { $value: '0.5rem' },
      400: { $value: '1rem' },
      full: { $value: '624.9375rem' },
    },
    space: {
      0: { $value: '0rem' },
      '050': { $value: '0.125rem' },
      100: { $value: '0.25rem' },
      150: { $value: '0.375rem' },
      200: { $value: '0.5rem' },
      300: { $value: '0.75rem' },
      400: { $value: '1rem' },
      600: { $value: '1.5rem' },
      800: { $value: '2rem' },
      1200: { $value: '3rem' },
      1600: { $value: '4rem' },
      2400: { $value: '6rem' },
      4000: { $value: '10rem' },
      'negative-100': { $value: '-0.25rem' },
      'negative-200': { $value: '-0.5rem' },
      'negative-300': { $value: '-0.75rem' },
      'negative-400': { $value: '-1rem' },
      'negative-600': { $value: '-1.5rem' },
    },
    stroke: {
      border: { $value: '0.0625rem' },
      'focus-ring': { $value: '0.125rem' },
    },
  },
  typography: {
    family: {
      $type: 'fontFamily',
      mono: { $value: ['roboto mono', 'monospace'] },
      sans: { $value: ['inter', 'sans-serif'] },
      serif: { $value: ['noto serif', 'serif'] },
    },
    scale: {
      $type: 'dimension',
      '01': { $value: '0.75rem' },
      '02': { $value: '0.875rem' },
      '03': { $value: '1rem' },
      '04': { $value: '1.25rem' },
      '05': { $value: '1.5rem' },
      '06': { $value: '2rem' },
      '07': { $value: '2.5rem' },
      '08': { $value: '3rem' },
      '09': { $value: '4rem' },
      10: { $value: '4.5rem' },
    },
    weight: {
      $type: 'fontWeight',
      thin: { $value: 100 },
      'extra-light': { $value: 200 },
      light: { $value: 300 },
      regular: { $value: 400 },
      medium: { $value: 500 },
      'semi-bold': { $value: 600 },
      bold: { $value: 700 },
      'extra-bold': { $value: 800 },
      black: { $value: 900 },
    },
  },
};
