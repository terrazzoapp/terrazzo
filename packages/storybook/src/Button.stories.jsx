import { Button } from '@terrazzo/tiles';
import StickerSheet from './components/StickerSheet.tsx';

export default {
  title: 'Components/Action/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
};

export const Overview = {
  render() {
    return (
      <StickerSheet
        columns={['size="m"', 'size="s"']}
        rows={[
          'primary',
          'primary (disabled)',
          'secondary',
          'secondary (disabled)',
          'lime',
          'lime (disabled)',
          'blue',
          'blue (disabled)',
          'orange',
          'orange (disabled)',
        ]}
        variants={[
          <Button key='primary' variant='primary'>
            Primary
          </Button>,
          <Button key='primary-s' variant='primary' size='s'>
            Primary (S)
          </Button>,
          <Button key='primary-disabled' variant='primary' disabled>
            Primary
          </Button>,
          <Button key='primary-s-disabled' variant='primary' disabled size='s'>
            Primary (S)
          </Button>,
          <Button key='secondary' variant='secondary'>
            Secondary
          </Button>,
          <Button key='secondary-s' variant='secondary' size='s'>
            Secondary (S)
          </Button>,
          <Button key='secondary-disabled' variant='secondary' disabled>
            Secondary
          </Button>,
          <Button key='secondary-s-disabled' variant='secondary' disabled size='s'>
            Secondary (S)
          </Button>,
          <Button key='lime' variant='lime'>
            Lime
          </Button>,
          <Button key='lime-s' variant='lime' size='s'>
            Lime (S)
          </Button>,
          <Button key='lime-disabled' variant='lime' disabled>
            Lime
          </Button>,
          <Button key='lime-s-disabled' variant='lime' disabled size='s'>
            Lime (S)
          </Button>,
          <Button key='blue' variant='blue'>
            Blue
          </Button>,
          <Button key='blue-s' variant='blue' size='s'>
            Blue (S)
          </Button>,
          <Button key='blue-disabled' variant='blue' disabled>
            Blue
          </Button>,
          <Button key='blue-s-disabled' variant='blue' disabled size='s'>
            Blue (S)
          </Button>,
          <Button key='orange' variant='orange'>
            Orange
          </Button>,
          <Button key='orange-s' variant='orange' size='s'>
            Orange (S)
          </Button>,
          <Button key='orange-disabled' variant='orange' disabled>
            Orange
          </Button>,
          <Button key='orange-s-disabled' variant='orange' disabled size='s'>
            Orange (S)
          </Button>,
        ]}
      />
    );
  },
};
