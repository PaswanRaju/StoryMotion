import { z } from 'zod';
export const PreferencesSchema = z.object({
  narrationRate: z.number().min(0.6).max(1.4).default(0.88),
  sensitivity: z.enum(['gentle', 'standard', 'deliberate']).default('standard'),
  seated: z.boolean().default(false),
  captions: z.boolean().default(true),
  reducedMotion: z.boolean().default(false),
  volume: z.number().min(0).max(1).default(0.8),
  camera: z.boolean().default(true),
  classroom: z.boolean().default(false),
  coop: z.boolean().default(false),
  language: z.enum(['en', 'es']).default('en'),
});
export type Preferences = z.infer<typeof PreferencesSchema>;
const defaults = PreferencesSchema.parse({});
export const PREFERENCES_KEY = 'storymotion.preferences.v1';
export function loadPreferences(): Preferences {
  try {
    return PreferencesSchema.parse(
      JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? '{}'),
    );
  } catch {
    return defaults;
  }
}
