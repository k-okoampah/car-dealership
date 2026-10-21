import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
  (window as unknown as { Buffer: typeof Buffer; global: unknown }).Buffer = Buffer;
  (window as unknown as { Buffer: typeof Buffer; global: unknown }).global = window;
}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

