import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MagicGestureDemo } from './components/gesture/MagicGestureDemo';

createRoot(document.getElementById('root')!).render(<StrictMode><MagicGestureDemo /></StrictMode>);
