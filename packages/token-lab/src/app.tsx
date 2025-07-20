import './styles/tokens.css';
import '@terrazzo/fonts/fragment-mono.css';
import '@terrazzo/fonts/instrument-sans.css';
import '@terrazzo/tiles/dist/all-components.css';
import '@terrazzo/react-color-picker/dist/styles.css';
import './styles/global.css';
import { Provider as JotaiProvider } from 'jotai';
import { TokensFileContext } from './hooks/tokens.js';
import { DefaultLayout } from './layouts/Default/Default.js';

export default function App({ tokensFile, onUpdate }: { tokensFile?: string; onUpdate?: (file: string) => unknown }) {
  return (
    <JotaiProvider>
      <TokensFileContext value={[tokensFile, onUpdate]}>
        <DefaultLayout />
      </TokensFileContext>
    </JotaiProvider>
  );
}
