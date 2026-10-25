import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { BodyGesture } from '../../vision/bodyGestures';
import { MOMENTS } from '../../engine/automaticStory';
import type { MomentId } from '../../engine/automaticStory';
import {
  CloudLayer,
  FarTreesLayer,
  ForegroundLayer,
  GroundLayer,
  HillsLayer,
  LightLayer,
  MidTreesLayer,
  SkyLayer,
  SunRays,
} from './layers';
import { Crowd, ForkSign, Hare, Shield, Tortoise } from './characters';
import {
  camera,
  CLOUD_TILE,
  ENDING_CARD_MS,
  FORK_BOX,
  HARE_BOX,
  hareFacesLeft,
  hareState,
  hareX,
  LANES,
  layerWidth,
  MARKS,
  PARALLAX,
  pathNudge,
  TORTOISE_BOX,
  tortoiseX,
  VIEW,
} from './timeline';
import { CONFETTI_COLORS, LEAF_COLORS, ParticleField } from './particles';
import type { ShieldZone } from './particles';
import {
  activateShield,
  boostBurst,
  celebrationBurst,
  createMagicTrail,
  pathHighlight,
} from './effects';
import { tortoiseState } from './characterState';
import { storyBeatIndex } from '../../data/stories/animatedBeats';
import type { Outcome, Reaction } from './characterState';
import './forest.css';

type Props = {
  elapsed: number;
  magic: boolean;
  paused: boolean;
  gesture: BodyGesture | null;
  /** One outcome per interaction moment: the gesture, 'auto' if it resolved itself, or null. */
  outcomes?: readonly (Outcome | null)[];
  /** Index of the currently open interaction moment, if any. */
  openMoment?: number | null;
  onFinishLine?: () => void;
  characterId?: string;
};
type Live = {
  effects: Reaction[];
  boostAt: number | null;
  hareChosen: boolean;
  windUntil: number;
  holding: boolean;
  nudge: { at: number; dir: -1 | 1 } | null;
  reduced: boolean;
  onFinishLine?: () => void;
};

const SHIELD_MS = 6500;
const GLOW_MS = 1600;
const POP_MS = 1800;
const LOOK_MS = 1600;
const BOOST_MS = 4500;
function popWord({ moment, outcome }: Reaction) {
  if (moment === 'shield')
    return outcome === 'auto' ? 'Tucked in safe!' : '✨ Magic shield!';
  if (moment === 'path')
    return outcome === 'LEAN_LEFT' ? '← Shady woods!' : 'Sunny meadow! →';
  return outcome === 'auto' ? 'Steady and strong!' : '✨ Zoom!';
}
const LAYERS = [
  ['hills', PARALLAX.hills, HillsLayer],
  ['farTrees', PARALLAX.farTrees, FarTreesLayer],
  ['midTrees', PARALLAX.midTrees, MidTreesLayer],
  ['ground', PARALLAX.ground, GroundLayer],
] as const;
const random = (a: number, b: number) => a + Math.random() * (b - a);
const reducedMotionQuery = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Cinematic Tortoise and the Hare scene. React renders states 5×/s from story time;
 * one rAF loop interpolates time between ticks and writes transforms and particles
 * directly, so camera, parallax and characters move at display rate. While an
 * invitation is open, story time holds but particles and idle animation keep going.
 */
export function ForestRaceScene({
  elapsed,
  magic,
  paused,
  gesture,
  outcomes,
  openMoment = null,
  onFinishLine,
  characterId,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const clouds = useRef<HTMLDivElement>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const foreground = useRef<HTMLDivElement>(null);
  const tortoise = useRef<HTMLDivElement>(null);
  const hare = useRef<HTMLDivElement>(null);
  const fork = useRef<HTMLDivElement>(null);
  const crowds = useRef<(HTMLDivElement | null)[]>([]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pixelRatio = useRef(1);
  const clock = useRef({ base: 0, at: 0, paused: false, holding: false, shown: 0 });
  const live = useRef<Live>({
    effects: [],
    boostAt: null,
    hareChosen: false,
    windUntil: -1,
    holding: false,
    nudge: null,
    reduced: false,
  });

  // Record the story time at which each moment resolved (adjusting state during render).
  const answers = outcomes ?? [gesture];
  const key = answers.join('|');
  const [fx, setFx] = useState<{ key: string; list: Reaction[] }>({ key: '', list: [] });
  if (fx.key !== key)
    setFx({
      key,
      list: answers.flatMap((outcome, index) =>
        outcome && MOMENTS[index]
          ? [
              {
                moment: MOMENTS[index].id,
                outcome,
                at:
                  fx.list.find(
                    (e) => e.moment === MOMENTS[index].id && e.outcome === outcome,
                  )?.at ?? elapsed,
              },
            ]
          : [],
      ),
    });

  const hareChosen = characterId === 'hare';
  const openId: MomentId | null =
    openMoment === null ? null : (MOMENTS[openMoment]?.id ?? null);
  const find = (moment: MomentId) => fx.list.find((e) => e.moment === moment);
  const shieldFx = find('shield');
  const pathFx = find('path');
  const boostFx = find('boost');
  const boostAt =
    !hareChosen && boostFx?.outcome === 'HAND_RAISE' ? boostFx.at : null;
  // No answer at the fork: the story takes the sunny meadow by default.
  const lane = pathFx
    ? pathFx.outcome === 'LEAN_LEFT'
      ? 'shady'
      : 'sunny'
    : null;
  const laneClass = lane ? `lane-${lane}` : '';
  const shielded =
    shieldFx?.outcome === 'ARMS_WIDE' && elapsed < shieldFx.at + SHIELD_MS;
  const windUntil =
    openId === 'shield' ? Infinity : shieldFx ? shieldFx.at + 2500 : -1;
  const glowing =
    shieldFx?.outcome === 'ARMS_WIDE' && elapsed < shieldFx.at + GLOW_MS;
  const tState = tortoiseState({
    t: elapsed,
    boostAt,
    open: hareChosen ? null : openId,
    reactions: hareChosen ? [] : fx.list,
  });
  const hState = hareState(elapsed);
  const beat = storyBeatIndex(elapsed);
  // The latest resolution gets a pop-word over the chosen character.
  const recent = [...fx.list].reverse().find((e) => elapsed < e.at + POP_MS);
  const looking =
    pathFx && pathFx.outcome !== 'auto' && elapsed < pathFx.at + LOOK_MS
      ? pathFx.outcome === 'LEAN_LEFT'
        ? ' fx-look-up'
        : ' fx-look-down'
      : '';
  const actorFx = (chosen: boolean) => {
    if (!chosen || !recent) return '';
    if (recent.outcome === 'auto')
      return recent.moment === 'shield' && hareChosen ? ' fx-crouch' : '';
    // The Tortoise's reactions are states; the Hare (as hero) gets a happy hop.
    return hareChosen ? ' fx-react' : recent.moment === 'path' ? ` fx-react${looking}` : '';
  };
  const pop = (chosen: boolean) =>
    chosen && recent ? (
      <div key={`${recent.moment}${recent.at}`} className="actor-pop" aria-hidden="true">
        {popWord(recent)}
      </div>
    ) : null;

  useLayoutEffect(() => {
    live.current = {
      effects: fx.list,
      boostAt,
      hareChosen,
      windUntil,
      holding: openId !== null,
      nudge:
        pathFx && pathFx.outcome !== 'auto'
          ? { at: pathFx.at, dir: pathFx.outcome === 'LEAN_LEFT' ? -1 : 1 }
          : null,
      reduced: reducedMotionQuery(),
      onFinishLine,
    };
    clock.current = {
      ...clock.current,
      base: elapsed,
      at: performance.now(),
      paused,
      holding: openId !== null,
    };
  });

  useEffect(() => {
    const field = new ParticleField();
    let context: CanvasRenderingContext2D | null | undefined;
    const fired = new Set<string>();
    let last = clock.current.base;
    let lastNow = performance.now();
    /** 0–1: eases in while an invitation is open (letterbox + push-in on the hero). */
    let focus = 0;
    const chosenPoint = (t: number) => {
      const { hareChosen: h, boostAt: boost } = live.current;
      return h
        ? { x: hareX(t) + 20, y: LANES.hare - 110 }
        : { x: tortoiseX(t, boost) + 20, y: LANES.tortoise - 95 };
    };
    const view = (t: number) => {
      const { boostAt: boost, reduced, nudge, hareChosen: h } = live.current;
      const cam = camera(t, boost, reduced);
      if (nudge && !reduced) cam.x += pathNudge(t, nudge.at, nudge.dir);
      if (focus > 0.001 && !reduced) {
        // Push in a little and drift toward the character who needs help.
        const hero = h ? hareX(t) : tortoiseX(t, boost) + 60;
        cam.x += (hero - (cam.x + VIEW.width / 2)) * 0.18 * focus;
        cam.zoom *= 1 + 0.09 * focus;
      }
      return cam;
    };
    const emit = (t: number, dt: number) => {
      const { effects, boostAt: boost, windUntil: windEnd, reduced } = live.current;
      const cam = view(t);
      const amount = reduced ? 0.3 : 1;
      const chance = (perSecond: number) => Math.random() < perSecond * dt * amount;
      if (!reduced && chance(6))
        field.add('pollen', random(0, VIEW.width), random(300, 1000), {
          vx: random(-15, 15),
          vy: random(-30, -10),
          max: 5,
          size: random(3, 6),
          screen: true,
        });
      if (!reduced && hareState(t) === 'run' && chance(30))
        field.add('dust', hareX(t) - 50, LANES.hare - 5, {
          vx: random(-140, -40),
          vy: random(-60, -20),
          max: 0.8,
          size: random(10, 18),
          color: '#d9bf8f',
        });
      if (boost !== null && t >= boost && t < boost + BOOST_MS)
        createMagicTrail(field, { x: tortoiseX(t, boost), y: LANES.tortoise - 75 }, dt, amount);
      if (t < windEnd && chance(38))
        field.add('leaf', cam.x + VIEW.width + 40, random(600, 900), {
          vx: -random(700, 1100),
          vy: random(-40, 70),
          vr: random(-6, 6),
          max: 3,
          size: random(10, 18),
          color: LEAF_COLORS[Math.floor(random(0, LEAF_COLORS.length))],
        });
      for (const e of effects) {
        const id = `${e.moment}:${e.outcome}`;
        if (fired.has(id)) continue;
        fired.add(id);
        const p = chosenPoint(t);
        if (e.outcome === 'auto') {
          if (e.moment === 'path') pathHighlight(field, p, true, cam.x, VIEW.width, amount * 0.5);
          continue;
        }
        if (e.moment === 'shield') activateShield(field, p, amount);
        else if (e.moment === 'path')
          pathHighlight(field, p, e.outcome === 'LEAN_RIGHT', cam.x, VIEW.width, amount);
        else boostBurst(field, p, amount);
      }
      if (!fired.has('finish') && tortoiseX(t, boost) >= MARKS.finish) {
        fired.add('finish');
        live.current.onFinishLine?.();
        celebrationBurst(field, { x: MARKS.finish, y: 600 }, amount);
      }
      if (fired.has('finish') && chance(14))
        field.add('confetti', cam.x + random(0, VIEW.width), -20, {
          vx: random(-60, 60),
          vy: random(120, 220),
          vr: random(-6, 6),
          gravity: 30,
          max: 6,
          size: random(12, 18),
          color: CONFETTI_COLORS[Math.floor(random(0, CONFETTI_COLORS.length))],
        });
    };
    const place = (t: number, now: number, running: boolean) => {
      const { boostAt: boost, hareChosen: h, effects, holding } = live.current;
      if (running) {
        const step = Math.min(0.05, Math.max(0, (now - lastNow) / 1000));
        focus += ((holding ? 1 : 0) - focus) * Math.min(1, step * 3);
      }
      const cam = view(t);
      if (world.current) world.current.style.transform = `scale(${cam.zoom})`;
      LAYERS.forEach(([, factor], i) => {
        const el = layers.current[i];
        if (el) el.style.transform = `translate3d(${-cam.x * factor}px,0,0)`;
      });
      if (foreground.current)
        foreground.current.style.transform = `translate3d(${-cam.x * PARALLAX.foreground}px,0,0)`;
      if (clouds.current) {
        const drift = (cam.x * PARALLAX.clouds + (t / 1000) * 14) % CLOUD_TILE;
        clouds.current.style.transform = `translate3d(${-drift}px,0,0)`;
      }
      const put = (el: HTMLDivElement | null, x: number, y: number) => {
        if (el) el.style.transform = `translate3d(${x - cam.x}px,${y}px,0)`;
      };
      put(fork.current, MARKS.fork + FORK_BOX.x, LANES.tortoise - 105 + FORK_BOX.y);
      put(tortoise.current, tortoiseX(t, boost) + TORTOISE_BOX.x, LANES.tortoise + TORTOISE_BOX.y);
      put(hare.current, hareX(t) + HARE_BOX.x, LANES.hare + HARE_BOX.y);
      put(crowds.current[0], MARKS.tortoiseStart - 330, 700);
      put(crowds.current[1], MARKS.finish + 190, 700);

      // Particles: restart clears them; pause freezes them; a story hold does not.
      if (t < last - 1000) {
        field.clear();
        fired.clear();
      }
      const dt = Math.min(0.05, Math.max(0, (now - lastNow) / 1000));
      lastNow = now;
      if (running) {
        emit(t, dt);
        const shield = effects.find(
          (e) => e.moment === 'shield' && e.outcome === 'ARMS_WIDE' && t < e.at + SHIELD_MS,
        );
        let zone: ShieldZone = null;
        if (shield)
          zone = h
            ? { x: hareX(t) + 20, y: LANES.hare - 130, rx: 175, ry: 170 }
            : { x: tortoiseX(t, boost) + 30, y: LANES.tortoise - 95, rx: 200, ry: 150 };
        field.update(dt, zone);
      }
      last = t;
      const el = canvas.current;
      if (!el) return;
      if (context === undefined) context = el.getContext('2d');
      if (!context) return;
      const k = pixelRatio.current;
      context.setTransform(k, 0, 0, k, 0, 0);
      context.clearRect(0, 0, VIEW.width, VIEW.height);
      if (field.count) field.draw(context, cam);
    };
    let frame = 0;
    const loop = (now: number) => {
      const c = clock.current;
      const candidate =
        c.paused || c.holding ? c.shown : Math.min(c.base + (now - c.at), c.base + 400);
      // Hold position instead of stepping back slightly when a tick lands; accept restarts.
      const t = candidate < c.shown && c.shown - candidate < 500 ? c.shown : candidate;
      c.shown = t;
      place(t, now, !c.paused);
      frame = requestAnimationFrame(loop);
    };
    place(clock.current.base, performance.now(), false);
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const fit = () => {
      // A hidden or not-yet-laid-out container reports 0; never collapse the stage to scale(0).
      if (!el.clientWidth) return;
      const scale = el.clientWidth / VIEW.width;
      if (stage.current) stage.current.style.transform = `scale(${scale})`;
      // Canvas backing store matches device pixels (capped) so particles stay crisp.
      const k = Math.min(2, Math.max(0.5, scale * (window.devicePixelRatio || 1)));
      pixelRatio.current = k;
      if (canvas.current) {
        canvas.current.width = Math.round(VIEW.width * k);
        canvas.current.height = Math.round(VIEW.height * k);
      }
    };
    fit();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const shieldEl = (left: number, top: number, rx: number, ry: number) => (
    <div className="actor-shield" style={{ left, top }}>
      <Shield rx={rx} ry={ry} />
    </div>
  );

  return (
    <div
      ref={root}
      className={`animated-story forest-scene ${paused ? 'is-paused' : ''} ${magic ? 'has-magic' : ''} ${gesture ? `effect-${gesture.toLowerCase()}` : ''}${openId ? ' is-focus' : ''}`}
    >
      <div ref={stage} className="forest-stage">
        <div className="forest-sky">
          <SkyLayer />
        </div>
        <div className="forest-rays">
          <SunRays />
        </div>
        <div ref={world} className="forest-world">
          <div ref={clouds} className="forest-layer forest-clouds">
            <CloudLayer />
          </div>
          {LAYERS.map(([name, factor, Layer], i) => (
            <div
              key={name}
              ref={(el) => {
                layers.current[i] = el;
              }}
              className="forest-layer"
              style={{ width: layerWidth(factor) }}
            >
              <Layer />
            </div>
          ))}
          {[0, 1].map((i) => (
            <div
              key={i}
              ref={(el) => {
                crowds.current[i] = el;
              }}
              className={`forest-actor forest-crowd ${i === 1 && tState === 'celebrate' ? 'is-cheering' : ''}`}
            >
              <Crowd />
            </div>
          ))}
          <div
            ref={fork}
            className={`forest-actor forest-fork${openId === 'path' ? ' is-asking' : ''}${lane ? ` chose-${lane}` : ''}`}
            style={{ width: FORK_BOX.w }}
          >
            <ForkSign />
          </div>
          <div
            ref={hare}
            data-testid="hare-actor"
            className={`forest-actor hare is-${hState}${actorFx(hareChosen)}`}
            style={{ width: HARE_BOX.w }}
          >
            <div className={`actor-lane ${hareChosen ? laneClass : ''}`}>
              <div className={`actor-facing ${hareFacesLeft(elapsed) ? 'is-left' : ''}`}>
                <Hare />
              </div>
              {hareChosen && shielded && shieldEl(-40, 30, 175, 170)}
              {pop(hareChosen)}
            </div>
          </div>
          <div
            ref={tortoise}
            data-testid="tortoise-actor"
            data-state={tState}
            className={`story-traveler forest-actor tortoise is-${tState}${actorFx(!hareChosen)}`}
            style={{ width: TORTOISE_BOX.w }}
          >
            <div className={`actor-lane ${!hareChosen ? laneClass : ''}`}>
              <div className="actor-facing">
                <Tortoise />
              </div>
              {!hareChosen && shielded && shieldEl(-30, -25, 200, 150)}
              {pop(!hareChosen)}
            </div>
          </div>
          <div
            ref={foreground}
            className="forest-layer"
            style={{ width: layerWidth(PARALLAX.foreground) }}
          >
            <ForegroundLayer />
          </div>
        </div>
        <div className={`forest-tint ${laneClass}`} />
        <div className={`forest-dim${openId === 'shield' ? ' is-dark' : ''}`} />
        {glowing && <div key={shieldFx?.at} className="forest-glow" />}
        <div className="forest-light">
          <LightLayer />
        </div>
        <canvas ref={canvas} className="forest-particles" aria-hidden="true" />
        <div className="forest-vignette" />
        {beat > 0 && <div key={beat} className="forest-sweep" />}
        <div className="forest-letterbox" aria-hidden="true">
          <span />
          <span />
        </div>
        {elapsed < 1400 && <div className="forest-open-fade" />}
        {elapsed >= 27000 && elapsed < 28800 && <div className="forest-dip" />}
        {elapsed < 4300 && (
          <div className="forest-title" aria-hidden="true">
            <span>A StoryMotion Adventure</span>
            <strong>
              The Tortoise <em>and the</em> Hare
            </strong>
          </div>
        )}
        {elapsed >= ENDING_CARD_MS && (
          <div className="forest-endcard" aria-hidden="true">
            <span className="forest-endcard__stars">★ ★ ★</span>
            <strong>Slow and steady wins the race!</strong>
            <span>Tortoise kept going, one happy step at a time.</span>
          </div>
        )}
      </div>
    </div>
  );
}
