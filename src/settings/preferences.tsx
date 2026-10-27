import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { PreferencesSchema, loadPreferences } from './schema';
import type { Preferences } from './schema';
import { PREFERENCES_KEY } from './schema';
import { narrator } from '../audio/narrator';
import { setSfxVolume } from '../audio/sfx';
const defaults = PreferencesSchema.parse({});

const Context = createContext({
  settings: defaults,
  update: (_patch: Partial<Preferences>) => {},
});
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(loadPreferences);
  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(settings));
    } catch {
      /* Settings still work in memory. */
    }
    document.documentElement.dataset.reducedMotion = String(
      settings.reducedMotion,
    );
    document.documentElement.dataset.classroom = String(settings.classroom);
    document.documentElement.lang = settings.language;
    narrator.setRate(settings.narrationRate);
    narrator.setVolume(settings.volume);
    setSfxVolume(settings.volume);
  }, [settings]);
  return (
    <Context.Provider
      value={{
        settings,
        update: (patch) =>
          setSettings((prev) => PreferencesSchema.parse({ ...prev, ...patch })),
      }}
    >
      {children}
    </Context.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export const usePreferences = () => useContext(Context);
