import MainNav from './components/main-nav/main-nav';
import '@terrazzo/tokens/dist/index.css';
import '@terrazzo/fonts/fragment-mono.css';
import '@terrazzo/fonts/instrument-sans.css';
import '@terrazzo/tiles/dist/all-components.css';
import '@terrazzo/react-color-picker/dist/all-components.css';
import './styles/global.css';
import { Provider as JotaiProvider } from 'jotai';

export default function App() {
  return (
    <JotaiProvider>
      <MainNav />
    </JotaiProvider>
  );
}
