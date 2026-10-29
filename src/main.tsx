import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import '@fontsource-variable/fredoka';
import '@fontsource-variable/nunito';
import './styles/global.css';
import './styles/components.css';
import { router } from './app/router';
import { SessionProvider } from './app/SessionContext';
import './styles/cosmic.css';
import './ui/ui.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  </StrictMode>,
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/sw.js').catch(() => {});
}
