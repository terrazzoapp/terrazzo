import '@terrazzo/tokens/dist/index.css';
import '@terrazzo/fonts/fragment-mono.css';
import '@terrazzo/fonts/instrument-sans.css';
import '@terrazzo/tiles/dist/all-components.css';
import '@terrazzo/react-color-picker/dist/all-components.css';
import './styles/global.css';
import { DefaultLayout } from './layouts/Default/Default.js';

export default function App() {
  return <DefaultLayout />;
}
