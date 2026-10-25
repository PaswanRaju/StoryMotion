import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Mode } from '../engine/types';
import { setSfxEnabled } from '../audio/sfx';

type SessionValue = {
  mode: Mode;
  setMode: (mode: Mode) => void;
  characterId: string | null;
  setCharacterId: (characterId: string | null) => void;
  audioEnabled: boolean;
  toggleAudio: () => void;
  /** Sound effects (clicks, magic, celebrations); narration is separate. */
  sfxEnabled: boolean;
  toggleSfx: () => void;
};

const SessionContext = createContext<SessionValue | null>(null);

/**
 * In-memory-only session state (mode, character pick, audio toggle) per
 * CLAUDE.md §8: no camera data, no account, no persisted child data. Resets
 * on full page reload by design.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('solo');
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [sfxEnabled, setSfxOn] = useState(true);
  useEffect(() => setSfxEnabled(sfxEnabled), [sfxEnabled]);

  const value = useMemo<SessionValue>(
    () => ({
      mode,
      setMode,
      characterId,
      setCharacterId,
      audioEnabled,
      toggleAudio: () => setAudioEnabled((prev) => !prev),
      sfxEnabled,
      toggleSfx: () => setSfxOn((prev) => !prev),
    }),
    [mode, characterId, audioEnabled, sfxEnabled],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
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
