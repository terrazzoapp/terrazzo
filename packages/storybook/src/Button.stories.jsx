import { Button } from '@terrazzo/tiles';
import StickerSheet from './components/StickerSheet';

export default {
  title: 'Components/Action/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
};

export const Overview = {
  render(args) {
    return (
      <StickerSheet
        columns={['size="m"', 'size="s"']}
        rows={['primary', 'primary (disabled)', 'secondary', 'secondary (disabled)', 'tertiary', 'tertiary (disabled)']}
        variants={[
          <Button variant="primary">Primary</Button>,
          <Button variant="primary" size="s">
            Primary (S)
          </Button>,
          <Button variant="primary" disabled>
            Primary
          </Button>,
          <Button variant="primary" disabled size="s">
            Primary (S)
          </Button>,
          <Button variant="secondary">Secondary</Button>,
          <Button variant="secondary" size="s">
            Secondary (S)
          </Button>,
          <Button variant="secondary" disabled>
            Secondary
          </Button>,
          <Button variant="secondary" disabled size="s">
            Secondary (S)
          </Button>,
          <Button variant="tertiary">Tertiary</Button>,
          <Button variant="tertiary" size="s">
            Tertiary (S)
          </Button>,
          <Button variant="tertiary" disabled>
            Tertiary
          </Button>,
          <Button variant="tertiary" disabled size="s">
            Tertiary (S)
          </Button>,
        ]}
      />
    );
  },
};
