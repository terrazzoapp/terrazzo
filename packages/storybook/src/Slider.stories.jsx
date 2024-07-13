import { Slider } from '@terrazzo/tiles';
import { useState } from 'react';

export default {
  title: 'Components/Form/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
};

export const Overview = {
  args: {
    orientation: 'horizontal',
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0,
  },
  render(args) {
    const [value, setValue] = useState(args.defaultValue);

    return <Slider {...args} value={value} onChange={setValue} />;
  },
};
