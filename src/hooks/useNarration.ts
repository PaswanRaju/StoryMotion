import { useEffect } from 'react';
import { narrator } from '../audio/narrator';

/**
 * Speech is a best-effort enhancement. Captions and story time never wait for it.
 * `lineId` must be stable for a line: the narrator speaks each id once, so
 * re-renders, remounts and gestures never restart it. Change the id (e.g. on
 * restart) or call the returned replay() to speak a line again.
 */
export function useNarration(
  lineId: string,
  text: string,
  enabled: boolean,
  paused: boolean,
) {
  useEffect(() => {
    narrator.claim();
    return () => narrator.release();
  }, []);
  useEffect(() => narrator.setEnabled(enabled), [enabled]);
  useEffect(() => narrator.setPaused(paused), [paused]);
  useEffect(() => narrator.setLine(lineId, text), [lineId, text]);
  return narrator.replay;
}
