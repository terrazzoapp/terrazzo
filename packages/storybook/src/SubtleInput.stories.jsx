import { SubtleInput } from '@terrazzo/tiles';

export default {
  title: 'Components/Form/SubtleInput',
  component: SubtleInput,
  parameters: {
    layout: 'centered',
  },
};

export const Overview = {
  args: {
    type: 'number',
    defaultValue: 23.45,
  },
  render(args) {
    return <SubtleInput {...args} />;
  },
};
