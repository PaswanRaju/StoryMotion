import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { BodyGesture } from '../../vision/bodyGestures';
import { BEANSTALK_MOMENTS } from '../../engine/automaticStory';
import type { MomentId } from '../../engine/automaticStory';
import type { Outcome, Reaction } from '../forest/characterState';
import { ParticleField } from '../forest/particles';
import { activateShield, boostBurst, celebrationBurst, GOLD, spawnSparkles } from '../forest/effects';
import { Jack } from './Jack';
import { CastleInterior } from './CastleInterior';
import { Beanstalk, FarLayer, ForeLayer, GroundLayer, MidLayer } from './layers';
import {
  altitude,
  birds,
  camera,
  ENDCARD_MS,
  growth,
  isInside,
  jack,
  JACK_BOX,
  LANDING_MS,
  layerHeight,
  obstacle,
  PARALLAX,
  sproutScale,
  STALK_LEAVES,
  STALK_LENGTH_GUESS,
  stalkX,
  sunset,
  tipY,
  GROUND_Y,
  VIEW,
  WORLD_H,
} from './timeline';
import type { JackPlan, JackState } from './timeline';
import '../forest/forest.css';
import './beanstalk.css';

type Props = {
  elapsed: number;
  magic: boolean;
  paused: boolean;
  gesture: BodyGesture | null;
  outcomes?: readonly (Outcome | null)[];
  openMoment?: number | null;
  onFinishLine?: () => void;
  characterId?: string;
};
const POP_MS = 1800;
const LAYERS = [
  ['far', PARALLAX.far, FarLayer],
  ['mid', PARALLAX.mid, MidLayer],
  ['ground', PARALLAX.ground, GroundLayer],
] as const;
const random = (a: number, b: number) => a + Math.random() * (b - a);
const reducedMotionQuery = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function popWord({ moment, outcome }: Reaction) {
  if (moment === 'grow') return outcome === 'auto' ? 'Whoosh!' : '✨ Magic!';
  if (moment === 'dodge')
    return outcome === 'auto' ? 'Phew!' : outcome === 'LEAN_LEFT' ? '← Swing!' : 'Swing! →';
  return outcome === 'auto' ? 'Wheee!' : '🍃 Glide!';
}
function planFrom(list: readonly Reaction[]): JackPlan {
  const dodge = list.find((e) => e.moment === 'dodge');
  const glide = list.find((e) => e.moment === 'glide');
  return {
    dodge: dodge
      ? {
          side: dodge.outcome === 'LEAN_RIGHT' ? 1 : -1,
          at: dodge.at,
          byChild: dodge.outcome !== 'auto',
        }
      : null,
    glide: glide ? { at: glide.at, byChild: glide.outcome !== 'auto' } : null,
  };
}

/**
 * Jack and the Beanstalk: a tall world the camera travels through (garden → growing
 * beanstalk → climb → cloud kingdom), a cut inside the giant's castle, and a glide
 * home at sunset. React renders states 5×/s; one rAF loop writes camera, parallax,
 * growth, Jack and particles directly. Story time holds during invitations; idle
 * animation and particles keep moving.
 */
export function BeanstalkScene({
  elapsed,
  magic,
  paused,
  gesture,
  outcomes,
  openMoment = null,
  onFinishLine,
  characterId,
}: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const fore = useRef<HTMLDivElement>(null);
  const stalk = useRef<HTMLDivElement>(null);
  const sprout = useRef<HTMLDivElement>(null);
  const jackEl = useRef<HTMLDivElement>(null);
  const cloudEl = useRef<HTMLDivElement>(null);
  const birdsEl = useRef<HTMLDivElement>(null);
  const skyHigh = useRef<HTMLDivElement>(null);
  const skyKingdom = useRef<HTMLDivElement>(null);
  const skySunset = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pixelRatio = useRef(1);
  const clock = useRef({ base: 0, at: 0, paused: false, holding: false, shown: 0 });
  const live = useRef<{ effects: Reaction[]; plan: JackPlan; reduced: boolean; onFinishLine?: () => void }>({
    effects: [],
    plan: { dodge: null, glide: null },
    reduced: false,
  });

  const answers = outcomes ?? [gesture];
  const key = answers.join('|');
  const [fx, setFx] = useState<{ key: string; list: Reaction[] }>({ key: '', list: [] });
  if (fx.key !== key)
    setFx({
      key,
      list: answers.flatMap((outcome, index) =>
        outcome && BEANSTALK_MOMENTS[index]
          ? [
              {
                moment: BEANSTALK_MOMENTS[index].id,
                outcome,
                at:
                  fx.list.find((e) => e.moment === BEANSTALK_MOMENTS[index].id && e.outcome === outcome)?.at ??
                  elapsed,
              },
            ]
          : [],
      ),
    });
  const plan = planFrom(fx.list);
  const openId: MomentId | null =
    openMoment === null ? null : (BEANSTALK_MOMENTS[openMoment]?.id ?? null);
  const pose = jack(elapsed, plan);
  let jackState: JackState = pose.state;
  if (openId === 'grow') jackState = 'curious';
  if (openId === 'dodge' || openId === 'glide') jackState = 'scared';
  const inside = isInside(elapsed, !!plan.glide);
  const growFx = fx.list.find((e) => e.moment === 'grow');
  const growing = elapsed >= 12200 && elapsed < 17800;
  const recent = [...fx.list].reverse().find((e) => elapsed < e.at + POP_MS);
  const glideAt = plan.glide?.at ?? null;
  const dips = [
    [17600, 18400],
    [32600, 33400],
    ...(glideAt !== null ? [[glideAt, glideAt + 800]] : []),
  ].filter(([a, b]) => elapsed >= a && elapsed < b);
  const stirring = openId === 'glide' || (elapsed >= 39400 && inside);

  useLayoutEffect(() => {
    live.current = { effects: fx.list, plan, reduced: reducedMotionQuery(), onFinishLine };
    clock.current = { ...clock.current, base: elapsed, at: performance.now(), paused, holding: openId !== null };
  });

  useEffect(() => {
    const field = new ParticleField();
    let context: CanvasRenderingContext2D | null | undefined;
    const fired = new Set<string>();
    let last = clock.current.base;
    let lastNow = performance.now();
    let lastGrowth = -1;
    // Beanstalk stroke: drawn from the garden upward with a dash.
    const paths = stalk.current ? [...stalk.current.querySelectorAll<SVGPathElement>('.bs-stalk, .bs-vine, .bs-stalk-glow')] : [];
    const lengths = paths.map((p) => {
      try {
        return p.getTotalLength() || STALK_LENGTH_GUESS;
      } catch {
        return STALK_LENGTH_GUESS;
      }
    });
    paths.forEach((p, i) => {
      p.style.strokeDasharray = `${lengths[i]} ${lengths[i]}`;
      p.style.strokeDashoffset = `${lengths[i]}`;
    });
    const leaves = stalk.current ? [...stalk.current.querySelectorAll<SVGGElement>('.bs-leaf-inner')] : [];

    const emit = (t: number, dt: number, toStage: (x: number, y: number) => { x: number; y: number }) => {
      const { effects, plan: p, reduced } = live.current;
      const amount = reduced ? 0.3 : 1;
      const chance = (perSecond: number) => Math.random() < perSecond * dt * amount;
      const s = t / 1000;
      const j = jack(t, p);
      const jackStage = j.inside ? { x: j.x, y: j.y } : toStage(j.x, j.y);
      // Ambient magic dust
      if (!reduced && chance(5))
        field.add('pollen', random(0, VIEW.width), random(200, 1000), {
          vx: random(-15, 15), vy: random(-30, -10), max: 5, size: random(3, 6), screen: true,
        });
      // Glowing beans in Jack's hand
      if (s >= 7 && s < 11.6 && chance(22)) {
        const hand = { x: jackStage.x + 56 * (j.inside ? 0.5 : 1), y: jackStage.y - 110 };
        field.add('spark', hand.x + random(-20, 20), hand.y + random(-20, 20), {
          vx: random(-30, 30), vy: random(-90, -40), max: 1.2, size: random(4, 8), color: '#c8ff9a', screen: true, gravity: -20,
        });
      }
      // Growth sparkles at the rising tip
      if (s >= 12.2 && s < 17.8 && chance(40)) {
        const tip = toStage(stalkX(tipY(t)), tipY(t));
        field.add('spark', tip.x + random(-40, 40), tip.y + random(-20, 40), {
          vx: random(-120, 120), vy: random(-40, 120), max: 1.4, size: random(5, 11), color: ['#c8ff9a', '#fff4c2', '#8ef06a'][Math.floor(random(0, 3))], screen: true, gravity: 60,
        });
      }
      // Gliding sparkle trail
      if (p.glide?.byChild && j.state === 'glide' && chance(30))
        field.add('spark', jackStage.x + random(-60, 60), jackStage.y - 300, {
          vx: random(-40, 40), vy: random(-120, -40), max: 1.2, size: random(4, 9), color: GOLD[Math.floor(random(0, GOLD.length))], screen: true,
        });
      // Fireflies at sunset
      if (s > 46 && chance(8))
        field.add('pollen', random(0, VIEW.width), random(600, 1000), {
          vx: random(-20, 20), vy: random(-20, -5), max: 4, size: random(4, 7), color: '#ffe08a', screen: true,
        });
      for (const e of effects) {
        const id = `${e.moment}:${e.outcome}`;
        if (fired.has(id)) continue;
        fired.add(id);
        if (e.outcome === 'auto') {
          if (e.moment === 'grow') {
            const base = toStage(stalkX(GROUND_Y), GROUND_Y);
            spawnSparkles(field, base, 30, amount, ['#c8ff9a', '#8ef06a', '#fff4c2'], 300);
          }
          continue;
        }
        if (e.moment === 'grow') {
          // Magic travels from the child (top-left of the picture) into the sprout.
          const target = toStage(stalkX(GROUND_Y), GROUND_Y - 30);
          const from = { x: 200, y: 160 };
          for (let i = 0; i < 70 * amount; i++) {
            const k = i / 70;
            const flight = 0.7 + k * 0.4;
            field.add('spark', from.x + random(-30, 30), from.y + random(-30, 30), {
              delay: k * 0.5,
              vx: (target.x - from.x) / flight, vy: (target.y - from.y) / flight - 200,
              gravity: 400 / flight, max: flight, size: random(6, 12), color: GOLD[i % GOLD.length], screen: true,
            });
          }
          field.add('ring', target.x, target.y, { delay: 0.8, max: 0.9, size: 320, color: '#c8ff9a', screen: true });
          boostBurst(field, { x: target.x, y: target.y - 40 }, amount);
        } else if (e.moment === 'dodge') {
          spawnSparkles(field, { x: jackStage.x, y: jackStage.y - 160 }, 26, amount, ['#9fdcff', '#ffffff', '#fff4c2'], 320);
        } else {
          activateShield(field, { x: jackStage.x, y: jackStage.y - 200 }, amount, 200);
        }
      }
      if (!fired.has('land') && t >= LANDING_MS) {
        fired.add('land');
        live.current.onFinishLine?.();
        celebrationBurst(field, { x: jackStage.x, y: jackStage.y - 120 }, amount);
      }
    };

    const place = (t: number, now: number, running: boolean) => {
      const { plan: p, reduced } = live.current;
      const cam = camera(t, p, reduced);
      const j = jack(t, p);
      const toStage = (x: number, y: number) => ({
        x: cam.fx + (x - cam.fx) * cam.zoom,
        y: cam.fy + (y - cam.y - cam.fy) * cam.zoom,
      });
      if (world.current) {
        world.current.style.transformOrigin = `${cam.fx}px ${cam.fy}px`;
        world.current.style.transform = `scale(${cam.zoom})`;
      }
      LAYERS.forEach(([, factor], i) => {
        const el = layers.current[i];
        if (el) el.style.transform = `translate3d(0,${-cam.y * factor}px,0)`;
      });
      if (fore.current) fore.current.style.transform = `translate3d(0,${-cam.y * PARALLAX.fore}px,0)`;
      if (stalk.current) stalk.current.style.transform = `translate3d(0,${-cam.y}px,0)`;
      // Sky: garden blue → high deep blue → golden-lavender kingdom; sunset at the end.
      const alt = altitude(cam);
      if (skyHigh.current) skyHigh.current.style.opacity = `${Math.min(1, alt * 1.4)}`;
      if (skyKingdom.current) skyKingdom.current.style.opacity = `${Math.max(0, (alt - 0.75) * 4)}`;
      if (skySunset.current) skySunset.current.style.opacity = `${sunset(t)}`;
      // Beanstalk growth: dash reveal + leaves unfolding in turn.
      const k = growth(t);
      if (k !== lastGrowth) {
        lastGrowth = k;
        paths.forEach((path, i) => {
          path.style.strokeDashoffset = `${lengths[i] * (1 - k)}`;
        });
        leaves.forEach((leaf, i) => {
          const u = Math.max(0, Math.min(1, (k - STALK_LEAVES[i].at) / 0.05));
          // back-out: a little overshoot as each leaf pops open
          const b = u === 0 ? 0 : 1 + 2.2 * (u - 1) ** 3 + 1.2 * (u - 1) ** 2;
          leaf.style.transform = `scale(${b.toFixed(3)})`;
        });
      }
      if (sprout.current) {
        const sp = sproutScale(t) * (k > 0.04 ? 0 : 1);
        const at = { x: stalkX(GROUND_Y), y: GROUND_Y - cam.y };
        sprout.current.style.transform = `translate3d(${at.x - 60}px,${at.y - 110}px,0) scale(${sp})`;
      }
      if (jackEl.current) {
        const sc = j.scale;
        const y = j.inside ? j.y : j.y - cam.y;
        jackEl.current.style.transform = `translate3d(${j.x + JACK_BOX.x * sc}px,${y + JACK_BOX.y * sc}px,0) scale(${sc})`;
      }
      const ob = obstacle(t, p);
      if (cloudEl.current) {
        cloudEl.current.style.opacity = ob ? '1' : '0';
        if (ob) cloudEl.current.style.transform = `translate3d(${ob.x - 160}px,${ob.y - cam.y - 110}px,0) rotate(${Math.sin(ob.spin / 30) * 8}deg)`;
      }
      const flock = birds(t);
      if (birdsEl.current) {
        birdsEl.current.style.opacity = flock ? '1' : '0';
        if (flock) birdsEl.current.style.transform = `translate3d(${flock.x}px,${flock.y - cam.y}px,0)`;
      }
      // Particles: restart clears them; pause freezes them; a story hold does not.
      if (t < last - 1000) {
        field.clear();
        fired.clear();
      }
      const dt = Math.min(0.05, Math.max(0, (now - lastNow) / 1000));
      lastNow = now;
      if (running) {
        emit(t, dt, toStage);
        field.update(dt, null);
      }
      last = t;
      const el = canvas.current;
      if (!el) return;
      if (context === undefined) context = el.getContext('2d');
      if (!context) return;
      const r = pixelRatio.current;
      context.setTransform(r, 0, 0, r, 0, 0);
      context.clearRect(0, 0, VIEW.width, VIEW.height);
      if (field.count) field.draw(context, { x: 0, zoom: 1 });
    };
    let frame = 0;
    const loop = (now: number) => {
      const c = clock.current;
      const candidate = c.paused || c.holding ? c.shown : Math.min(c.base + (now - c.at), c.base + 400);
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
      if (!el.clientWidth) return;
      const scale = el.clientWidth / VIEW.width;
      if (stage.current) stage.current.style.transform = `scale(${scale})`;
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

  return (
    <div
      ref={root}
      className={`animated-story forest-scene beanstalk-scene ${paused ? 'is-paused' : ''} ${magic ? 'has-magic' : ''} ${gesture ? `effect-${gesture.toLowerCase()}` : ''}${openId ? ' is-focus' : ''}${inside ? ' is-inside' : ''}${growing ? ' is-growing' : ''}${growFx && growFx.outcome !== 'auto' && elapsed < growFx.at + 6000 ? ' is-grow-magic' : ''}`}
    >
      <div
        ref={stage}
        className="forest-stage"
      >
        <div className="bs-sky bs-sky--day" />
        <div ref={skyHigh} className="bs-sky bs-sky--high" />
        <div ref={skyKingdom} className="bs-sky bs-sky--kingdom" />
        <div ref={skySunset} className="bs-sky bs-sky--sunset" />
        <div className="bs-sun" />
        <div ref={world} className="forest-world">
          {LAYERS.map(([name, factor, Layer], i) => (
            <div
              key={name}
              ref={(el) => {
                layers.current[i] = el;
              }}
              className="forest-layer bs-layer"
              style={{ height: name === 'ground' ? WORLD_H + 40 : layerHeight(factor) }}
            >
              <Layer />
            </div>
          ))}
          <div ref={stalk} className="forest-layer bs-layer bs-stalk-layer" style={{ height: WORLD_H + 40 }}>
            <Beanstalk />
          </div>
          <div ref={sprout} className="forest-actor bs-sprout">
            <svg viewBox="-60 -110 120 120" width="120" height="120" aria-hidden="true">
              <path d="M0 0V-60" stroke="#4fa35a" strokeWidth="10" strokeLinecap="round" />
              <path d="M0 -50C-30 -80 -60 -60 -56 -40C-30 -36 -10 -40 0 -50Z" fill="#6cc45f" />
              <path d="M0 -60C30 -96 62 -76 56 -54C30 -50 10 -52 0 -60Z" fill="#8ed97a" />
              <circle cx="0" cy="-62" r="22" fill="#c8ff9a" opacity="0.5" className="bs-sprout-glow" />
            </svg>
          </div>
          <div ref={birdsEl} className="forest-actor bs-birds" style={{ opacity: 0 }}>
            {[0, 1, 2].map((i) => (
              <svg key={i} className="bs-bird" style={{ left: i * 90, top: (i % 2) * 50, animationDelay: `${i * 0.15}s` }} viewBox="-30 -15 60 30" width="60" height="30" aria-hidden="true">
                <path d="M-28 0Q-14 -14 0 0Q14 -14 28 0" stroke="#3a3a5a" strokeWidth="5" fill="none" strokeLinecap="round" />
              </svg>
            ))}
          </div>
          <div ref={cloudEl} className="forest-actor bs-tumble" style={{ opacity: 0 }}>
            <svg viewBox="-160 -110 320 220" width="320" height="220" aria-hidden="true">
              <ellipse cx="0" cy="30" rx="150" ry="60" fill="#f2f4ff" />
              <circle cx="-70" cy="0" r="60" fill="#f2f4ff" />
              <circle cx="20" cy="-30" r="80" fill="#ffffff" />
              <circle cx="100" cy="10" r="50" fill="#f2f4ff" />
              <circle cx="-20" cy="10" r="8" fill="#5a5f8a" />
              <circle cx="30" cy="10" r="8" fill="#5a5f8a" />
              <path d="M-10 34Q5 44 20 34" stroke="#5a5f8a" strokeWidth="5" fill="none" strokeLinecap="round" />
              <ellipse cx="-40" cy="26" rx="12" ry="6" fill="#ffb0c8" opacity="0.6" />
              <ellipse cx="50" cy="26" rx="12" ry="6" fill="#ffb0c8" opacity="0.6" />
            </svg>
          </div>
          <div ref={fore} className="forest-layer bs-layer" style={{ height: layerHeight(PARALLAX.fore) }}>
            <ForeLayer />
          </div>
          <div className={`bs-inside${stirring ? ' is-stirring' : ''}`}>
            <CastleInterior />
          </div>
          <div
            ref={jackEl}
            data-testid="jack-actor"
            data-state={jackState}
            className={`forest-actor jack is-${jackState}${pose.facing < 0 ? ' faces-left' : ''}`}
          >
            <Jack variant={characterId === 'adventurer' ? 'adventurer' : 'jack'} />
            {recent && (
              <div key={`${recent.moment}${recent.at}`} className="actor-pop bs-pop" aria-hidden="true">
                {popWord(recent)}
              </div>
            )}
          </div>
        </div>
        <canvas ref={canvas} className="forest-particles" aria-hidden="true" />
        <div className="forest-vignette" />
        <div className={`forest-dim${openId === 'glide' ? ' is-dark' : ''}`} />
        {growFx && growFx.outcome !== 'auto' && elapsed < growFx.at + 1600 && (
          <div key={growFx.at} className="forest-glow bs-glow-green" />
        )}
        <div className="forest-letterbox" aria-hidden="true">
          <span />
          <span />
        </div>
        {elapsed < 1400 && <div className="forest-open-fade" />}
        {dips.map(([a]) => (
          <div key={a} className="forest-dip" />
        ))}
        {elapsed < 4300 && (
          <div className="forest-title" aria-hidden="true">
            <span>A StoryMotion Adventure</span>
            <strong>
              Jack <em>and the</em> Beanstalk
            </strong>
          </div>
        )}
        {elapsed >= ENDCARD_MS && (
          <div className="forest-endcard" aria-hidden="true">
            <span className="forest-endcard__stars">★ ★ ★</span>
            <strong>A little courage goes a long way!</strong>
            <span>Jack climbed to the clouds and came home safe.</span>
          </div>
        )}
      </div>
    </div>
  );
}

