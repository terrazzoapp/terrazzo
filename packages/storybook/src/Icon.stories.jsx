import * as allIcons from '@terrazzo/icons';

export default {
  title: 'Icons',
};

export const Icons = {
  render() {
    return (
      <div
        style={{
          display: 'grid',
          gap: '2rem',
          gridTemplateColumns: 'repeat(auto-fill, 5rem)',
          maxWidth: '45rem',
          marginInline: 'auto',
          marginBlock: '4rem',
        }}
      >
        {Object.entries(allIcons).map(([name, Icon]) => (
          <div
            key={name}
            style={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              fontSize: '12px',
              gap: '1rem',
              textAlign: 'center',
            }}
          >
            <Icon />
            {name}
          </div>
        ))}
      </div>
    );
  },
};
