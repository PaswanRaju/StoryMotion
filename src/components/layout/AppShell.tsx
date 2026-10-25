import type { ReactNode } from 'react';
import { Header } from './Header';
import { SpaceBackdrop } from './SpaceBackdrop';
import { useUiSounds } from '../../hooks/useUiSounds';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  useUiSounds();
  return (
    <div className="app-shell">
      <SpaceBackdrop />
      <Header />
      <main className="app-shell__main">{children}</main>
    </div>
  );
}
