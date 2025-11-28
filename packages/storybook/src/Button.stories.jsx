import { Button } from '@terrazzo/tiles';
import StickerSheet from './components/StickerSheet.js';

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
        rows={['primary', 'primary (disabled)', 'secondary', 'secondary (disabled)', 'tertiary', 'tertiary (disabled)']}
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
          <Button key='tertiary' variant='tertiary'>
            Tertiary
          </Button>,
          <Button key='tertiary-s' variant='tertiary' size='s'>
            Tertiary (S)
          </Button>,
          <Button key='tertiary-disabled' variant='tertiary' disabled>
            Tertiary
          </Button>,
          <Button key='tertiary-s-disabled' variant='tertiary' disabled size='s'>
            Tertiary (S)
          </Button>,
        ]}
      />
    );
  },
};
