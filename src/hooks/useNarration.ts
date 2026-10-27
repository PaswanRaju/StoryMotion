import { useCallback, useEffect, useRef } from 'react';
import { narrator } from '../audio/narrator';
import { usePreferences } from '../settings/preferences';

export function useNarration(
  lineId: string,
  text: string,
  enabled: boolean,
  paused: boolean,
  audioSrc?: string,
  wordTimings?: { atMs: number; charIndex: number }[],
  language?: 'en' | 'es',
) {
  const { settings } = usePreferences();
  const audio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    narrator.claim();
    return () => narrator.release();
  }, []);
  useEffect(
    () => narrator.setLanguage(language ?? settings.language),
    [language, settings.language],
  );
  useEffect(() => narrator.setEnabled(enabled), [enabled]);
  useEffect(() => narrator.setPaused(paused), [paused]);
  useEffect(() => {
    if (!audioSrc) {
      narrator.setLine(lineId, text);
      return;
    }
    narrator.stop();
    const clip = new Audio(audioSrc);
    audio.current = clip;
    clip.onerror = () => {
      audio.current = null;
      narrator.setLine(lineId, text);
    };
    return () => {
      clip.pause();
      clip.onerror = null;
      clip.removeAttribute('src');
      clip.load();
      audio.current = null;
    };
  }, [lineId, text, audioSrc]);
  useEffect(() => {
    const clip = audio.current;
    if (!clip) return;
    clip.volume = settings.volume;
    clip.playbackRate = settings.narrationRate / 0.88;
    if (paused || !enabled) clip.pause();
    else
      void clip.play().catch(() => {
        audio.current = null;
        narrator.setLine(lineId, text);
      });
  }, [enabled, paused, settings.volume, settings.narrationRate, lineId, text]);
  const getCharIndex = useCallback(() => {
    if (!enabled) return -1;
    if (audio.current) {
      const clip = audio.current;
      const index = wordTimings?.findLast(
        (word) => word.atMs <= clip.currentTime * 1000,
      )?.charIndex;
      return (
        index ??
        (Number.isFinite(clip.duration) && clip.duration > 0
          ? Math.floor((text.length * clip.currentTime) / clip.duration)
          : -1)
      );
    }
    const speech = narrator.state;
    return speech.lineId === lineId && speech.status === 'speaking'
      ? speech.charIndex
      : -1;
  }, [lineId, text, enabled, wordTimings]);
  return {
    getCharIndex,
    replay: () => {
      if (audio.current) {
        audio.current.currentTime = 0;
        if (enabled && !paused) void audio.current.play().catch(() => {});
      } else narrator.replay();
    },
  };
}
