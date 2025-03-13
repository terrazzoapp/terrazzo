import React from 'react';
import { createRoot } from 'react-dom/client';
import TokenLab from '@terrazzo/token-lab';

const response = await fetch("/api/tokens")
const tokenFile = await response.text()
const root = createRoot(document.getElementById('app'));
root.render(<TokenLab tokensFile={tokenFile} />);
