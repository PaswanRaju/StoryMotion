import { Outlet } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ErrorBoundary } from '../components/layout/ErrorBoundary';
import { ToastProvider } from '../ui';

export function App() {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <AppShell>
          <Outlet />
        </AppShell>
      </ErrorBoundary>
    </ToastProvider>
  );
}
