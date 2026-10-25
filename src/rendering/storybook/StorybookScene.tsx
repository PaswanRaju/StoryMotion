import { useEffect, useRef } from 'react';
import type { StoryId } from '../../engine/types';
import type { MomentId } from '../../data/stories/scenes';
import { sceneAt, storyMoments, STORY_SCENES } from '../../data/stories/scenes';
import { playSfx } from '../../audio/sfx';
import type { Outcome } from '../forest/characterState';
import { ease, useStoryClock, wave } from './clock';
import { CastDefs } from './cast';
import type { SceneCtx } from './beanstalkScenes';
import { ENDCARD_AT, STORYBOOK_SCENES } from './registry';
import '../forest/forest.css';
import '../beanstalk/beanstalk.css';
import './storybook.css';

const TITLES: Partial<Record<StoryId, [string, string, string]>> = {
  beanstalk: ['Jack', 'and the', 'Beanstalk'],
  pigs: ['The Three', '', 'Little Pigs'],
};
const MORALS: Partial<Record<StoryId, string>> = {
  beanstalk: 'Be brave, think before you choose, and share what you have.',
  pigs: 'Hard work and careful planning keep everyone safe.',
};
const FADE_IN = 700;
const FADE_OUT = 450;

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Renders the scene-based stories (Jack and the Beanstalk, The Three Little Pigs).
 * The active scene comes from the same scene list the narrator and captions use;
 * each scene is a pure function of its local story time, so pausing, holding for
 * an invitation, and restarting all behave exactly like the story engine.
 */
export function StorybookScene({
  storyId,
  elapsed,
  paused,
  outcomes = [],
  openMoment = null,
  magic = false,
}: {
  storyId: StoryId;
  elapsed: number;
  paused: boolean;
  outcomes?: readonly (Outcome | null)[];
  openMoment?: number | null;
  magic?: boolean;
}) {
  const { t: time, idle } = useStoryClock(elapsed, paused, openMoment !== null);
  const active = sceneAt(storyId, time);
  const def = STORYBOOK_SCENES[active.scene.id];
  const moments = storyMoments(storyId);
  const open: MomentId | null = openMoment === null ? null : (moments[openMoment]?.id ?? null);
  const ctx: SceneCtx = {
    t: active.local,
    idle,
    dur: active.scene.durationMs,
    open,
    outcome: (id) => {
      const index = moments.findIndex((m) => m.id === id);
      return index >= 0 ? (outcomes[index] ?? null) : null;
    },
  };

  // Scene sound cues fire once as story time passes them (never while paused/holding).
  const last = useRef({ scene: '', t: 0 });
  useEffect(() => {
    const prev = last.current;
    const cues = def?.cues ?? [];
    if (prev.scene === active.scene.id && ctx.t > prev.t && ctx.t - prev.t < 1500)
      for (const [at, cue] of cues) if (at > prev.t && at <= ctx.t) playSfx(cue);
    if (prev.scene !== active.scene.id)
      for (const [at, cue] of cues) if (at <= ctx.t && ctx.t < 400) playSfx(cue);
    last.current = { scene: active.scene.id, t: ctx.t };
  });

  // Fit the 1920×1080 stage to the frame.
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const fit = () => {
      if (el.clientWidth && stage.current)
        stage.current.style.transform = `scale(${el.clientWidth / 1920})`;
    };
    fit();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cam = def?.camera?.(ctx) ?? {};
  const still = reducedMotion();
  const zoom = still ? 1 : (cam.zoom ?? 1);
  const cx = cam.cx ?? 960;
  const cy = cam.cy ?? 540;
  const shake = still ? 0 : (cam.shake ?? 0);
  const sx = shake * wave(idle, 70);
  const sy = shake * wave(idle, 90, 1);
  const fade = Math.max(
    1 - ease(ctx.t, 0, FADE_IN),
    ease(ctx.t, ctx.dur - FADE_OUT, ctx.dur),
  );
  const scenes = STORY_SCENES[storyId];
  const isFirst = active.index === 0;
  const isLast = active.index === scenes.length - 1;
  const endcardAt = ENDCARD_AT[storyId] ?? Infinity;
  const title = TITLES[storyId];

  return (
    <div
      ref={root}
      className={`animated-story forest-scene storybook-scene${paused ? ' is-paused' : ''}${open ? ' is-focus' : ''}${magic ? ' has-magic' : ''}`}
      data-testid="storybook-scene"
      data-scene={active.scene.id}
      role="img"
      aria-label={`${active.scene.title}: ${active.scene.narration}`}
    >
      <div ref={stage} className="sb-stage">
        <svg className="sb-root" viewBox="0 0 1920 1080" width="1920" height="1080" aria-hidden="true">
          <CastDefs />
          {/* Camera: zoom about (cx, cy), plus a little shake on big impacts. */}
          <g
            transform={`translate(${(cx + sx).toFixed(1)} ${(cy + sy).toFixed(1)}) scale(${zoom.toFixed(4)}) translate(${-cx} ${-cy})`}
          >
            {def?.render(ctx)}
          </g>
          {fade > 0.001 && <rect width="1920" height="1080" fill="#120d1e" opacity={fade} />}
        </svg>
        <div className="forest-vignette" />
        <div className="forest-letterbox" aria-hidden="true">
          <span />
          <span />
        </div>
        {isFirst && ctx.t < 4300 && title && (
          <div className="forest-title" aria-hidden="true">
            <span>A StoryMotion Adventure</span>
            <strong>
              {title[0]} {title[1] && <em>{title[1]}</em>} {title[2]}
            </strong>
          </div>
        )}
        {isLast && ctx.t >= endcardAt && (
          <div className="forest-endcard sb-endcard" data-testid="story-endcard">
            <span className="forest-endcard__stars">★ ★ ★</span>
            <strong>The End</strong>
            <span>Adventure Complete!</span>
            <em>{MORALS[storyId]}</em>
          </div>
        )}
      </div>
    </div>
  );
}
