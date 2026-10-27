import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { PreferencesProvider } from '../settings/preferences';
import type { Mode } from '../engine/types';
import { setSfxEnabled } from '../audio/sfx';

type SessionValue = {
  mode: Mode;
  setMode: (mode: Mode) => void;
  characterId: string | null;
  setCharacterId: (characterId: string | null) => void;
  cameraOptedIn: boolean;
  setCameraOptedIn: (value: boolean) => void;
  audioEnabled: boolean;
  toggleAudio: () => void;
  /** Sound effects (clicks, magic, celebrations); narration is separate. */
  sfxEnabled: boolean;
  toggleSfx: () => void;
};

const SessionContext = createContext<SessionValue | null>(null);

/**
 * Mode, character and quick audio toggles live only in memory. The nested parent
 * preferences provider persists only explicitly chosen settings, never camera data.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('solo');
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [cameraOptedIn, setCameraOptedIn] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [sfxEnabled, setSfxOn] = useState(true);
  useEffect(() => setSfxEnabled(sfxEnabled), [sfxEnabled]);

  const value = useMemo<SessionValue>(
    () => ({
      mode,
      setMode,
      characterId,
      setCharacterId,
      cameraOptedIn,
      setCameraOptedIn,
      audioEnabled,
      toggleAudio: () => setAudioEnabled((prev) => !prev),
      sfxEnabled,
      toggleSfx: () => setSfxOn((prev) => !prev),
    }),
    [mode, characterId, audioEnabled, sfxEnabled, cameraOptedIn],
  );

  return (
    <PreferencesProvider>
      <SessionContext.Provider value={value}>
        {children}
      </SessionContext.Provider>
    </PreferencesProvider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook, not a component
export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}
