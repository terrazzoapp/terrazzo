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
    max: 100,
    step: 1,
    defaultValue: 0,
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
  render(args) {
    const [value, setValue] = useState(args.defaultValue);

    return (
      <div style={{ display: 'flex', justifyContent: 'center', width: '300px' }}>
        <Slider {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};
