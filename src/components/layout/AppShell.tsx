import type { ReactNode } from 'react';
import { Header } from './Header';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-shell__main">{children}</main>
    </div>
  );
}
