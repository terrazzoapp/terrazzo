import { Switch } from '@terrazzo/tiles';

export default {
  title: 'Components/Form/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
};

export const Overview = {
  args: {
    label: 'Rec 2020',
  },
  render(args) {
    return <Switch {...args} />;
  },
};
