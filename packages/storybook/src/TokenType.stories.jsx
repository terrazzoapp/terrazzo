import { TokenType } from '@terrazzo/tiles';

export default {
  title: 'Components/Display/TokenType',
  component: TokenType,
  parameters: {
    layout: 'centered',
  },
};

export const Overview = {
  render(args) {
    return (
      <div
        style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(8rem, 1fr))',
          width: '100%',
        }}
      >
        {[
          'color',
          'dimension',
          'fontFamily',
          'fontWeight',
          'duration',
          'cubicBezier',
          'number',
          'link',
          'strokeStyle',
          'border',
          'transition',
          'shadow',
          'gradient',
          'typography',
        ].map((type) => (
          <TokenType key={type} {...args} type={type} />
        ))}
      </div>
    );
  },
};
