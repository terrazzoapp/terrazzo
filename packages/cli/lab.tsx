import TokenLab from '@terrazzo/token-lab';
import { createRoot } from 'react-dom/client';

const response = await fetch('/api/tokens');
const tokenFile = await response.text();
const root = createRoot(document.getElementById('app'));

root.render(
  <TokenLab
    tokensFile={tokenFile}
    onUpdate={async (updatedTokens) => {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: updatedTokens,
      });

      if (!response.ok) {
        console.error(`Failed to save tokens: ${response.status}`);
      }
    }}
  />,
);
