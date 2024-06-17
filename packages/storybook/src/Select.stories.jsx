import { Select, SelectGroup, SelectItem } from '@terrazzo/tiles';
import { ColorFilterOutline } from '@terrazzo/icons';

export default {
  title: 'Components/Form/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
};

export const Overview = {
  render() {
    return (
      <Select
        trigger={
          <>
            <ColorFilterOutline />
            RGB
          </>
        }
      >
        <SelectGroup>
          <SelectItem value='rgb' icon={<ColorFilterOutline />}>
            RGB
          </SelectItem>
          <SelectItem value='oklab' icon={<ColorFilterOutline />}>
            Oklab
          </SelectItem>
          <SelectItem value='oklch' icon={<ColorFilterOutline />}>
            Oklch
          </SelectItem>
        </SelectGroup>
      </Select>
    );
  },
};
