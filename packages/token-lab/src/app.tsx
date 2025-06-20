import './styles/tokens.css';
import '@terrazzo/fonts/fragment-mono.css';
import '@terrazzo/fonts/instrument-sans.css';
import '@terrazzo/tiles/dist/all-components.css';
import '@terrazzo/react-color-picker/dist/all-components.css';
import './styles/global.css';
import { TokensFileContext } from './hooks/tokens-loader.js';
import { DefaultLayout } from './layouts/Default/Default.js';

export default function App({ tokensFile, onUpdate }: { tokensFile?: string; onUpdate?: (file: string) => unknown }) {
  return (
    <TokensFileContext value={[tokensFile, onUpdate]}>
      <DefaultLayout />
    </TokensFileContext>
  );
}
