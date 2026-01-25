import { createRoot } from 'react-dom/client';
import * as styles from './app.css.js';

function App() {
  return (
    <button className={styles.btn}>Click Me</button>
  )
}

const root = createRoot(document.getElementById('app')!)
root.render(<App />);
