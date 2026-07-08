import TokenLab from '@terrazzo/token-lab';
import { createRoot } from 'react-dom/client';

const tokenRes = await fetch('/api/tokens');
const tokenFile = await tokenRes.text();
const root = createRoot(document.getElementById('app'));

root.render(
  <TokenLab
    tokensFile={tokenFile}
    onUpdate={async (updatedTokens) => {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: updatedTokens,
      });

      if (!res.ok) {
        // oxlint-disable-next-line no-console
        console.error(`Failed to save tokens: ${res.status}`);
      }
    }}
  />,
);
