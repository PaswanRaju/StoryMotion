import { useEffect, useMemo, useState } from 'react';
import { GestureCamera } from '../gesture/GestureCamera';
import { GestureHint } from '../player/GestureHint';
import { useNarration } from '../../hooks/useNarration';
import { useSession } from '../../app/SessionContext';
import { usePreferences } from '../../settings/preferences';
import { playSfx } from '../../audio/sfx';
import type { BodyGesture, BodyTracking } from '../../gestures';
import './warmup.css';

const STEPS: { gesture: BodyGesture; text: string }[] = [
  { gesture: 'HAND_RAISE', text: 'Raise one hand to light a star!' },
  {
    gesture: 'ARMS_WIDE',
    text: 'Open your arms like a friendly space explorer!',
  },
  { gesture: 'LEAN_LEFT', text: 'Lean left to wave at the moon!' },
  { gesture: 'LEAN_RIGHT', text: 'Lean right to greet the sun!' },
  { gesture: 'CROUCH', text: 'Bend your knees a little, or tap the star!' },
  {
    gesture: 'BLOW',
    text: 'Make a gentle puff with your cheeks, or tap the star!',
  },
  { gesture: 'CLIMB', text: 'Reach one arm up, then the other!' },
  {
    gesture: 'CLAP',
    text: 'Open your hands, then bring them together for a clap!',
  },
  {
    gesture: 'RUN_IN_PLACE',
    text: 'Lift one knee, then the other. Seated? Move one arm, then the other!',
  },
];
const FRAMING = {
  stepBack: 'Step back a little so your hands fit!',
  showHands: 'Show me both of your hands!',
  ready: 'Lovely! I can see your hands.',
  moveIntoView: 'Stand in the glowing outline. Show me your hands!',
};
export function Warmup({
  onContinue,
  gestures,
}: {
  onContinue: () => void;
  gestures?: readonly BodyGesture[];
}) {
  const { audioEnabled, setCameraOptedIn } = useSession();
  const { settings } = usePreferences();
  const [stage, setStage] = useState(-1);
  const [framing, setFraming] =
    useState<NonNullable<BodyTracking['framing']>>('moveIntoView');
  const [spark, setSpark] = useState(0);
  const steps = useMemo(
    () =>
      STEPS.filter(
        (step) =>
          (!gestures
            ? [
                'HAND_RAISE',
                'ARMS_WIDE',
                'LEAN_LEFT',
                'LEAN_RIGHT',
                'CROUCH',
              ].includes(step.gesture)
            : gestures.includes(step.gesture)) &&
          (!settings.seated || step.gesture !== 'CROUCH'),
      ),
    [gestures, settings.seated],
  );
  const accepted = useMemo(
    () =>
      stage >= 0 && stage < steps.length
        ? [steps[stage].gesture]
        : (['HAND_RAISE', 'ARMS_WIDE'] as BodyGesture[]),
    [stage, steps],
  );
  const done = stage >= steps.length;
  const text =
    stage < 0
      ? `Hello, space explorer! ${FRAMING[framing]}`
      : done
        ? 'You are ready for an adventure!'
        : steps[stage].text;
  useNarration(
    `warmup:${stage}:${stage < 0 ? framing : ''}`,
    text,
    audioEnabled,
    false,
  );
  const finish = () => {
    try {
      localStorage.setItem('storymotion.warmup.done', 'true');
    } catch {
      /* Skipping still works. */
    }
    onContinue();
  };
  useEffect(() => {
    if (done) {
      const timer = setTimeout(onContinue, 2500);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(
      () => setStage((current) => current + 1),
      stage < 0 && framing === 'ready' ? 1200 : stage < 0 ? 12000 : 8000,
    );
    return () => clearTimeout(timer);
  }, [stage, framing, done, onContinue]);
  const answer = (gesture: BodyGesture) => {
    if (stage < 0 || done || gesture !== steps[stage].gesture) return;
    playSfx('recognized');
    setSpark((prev) => prev + 1);
    setStage((prev) => prev + 1);
  };
  return (
    <section className="warmup galaxy-panel">
      <p className="eyebrow">A little space practice</p>
      <h1>Hello, explorer!</h1>
      <div className="warmup-stage">
        <div className="warmup-guide" aria-hidden="true">
          <GestureHint
            gesture={stage >= 0 && !done ? steps[stage].gesture : 'ARMS_WIDE'}
          />
        </div>
        <div key={spark} className="warmup-stars" aria-hidden="true">
          ✦ · ✧ · ✦
        </div>
        <p role="status">{text}</p>
      </div>
      <GestureCamera
        acceptedGestures={accepted}
        recognitionEnabled={!done}
        onAction={() => answer('HAND_RAISE')}
        onGesture={(event) => {
          if (event.type !== 'HAND_RAISE') answer(event.type);
        }}
        onTracking={(tracking) =>
          setFraming(
            tracking.framing ?? (tracking.upperBody ? 'ready' : 'moveIntoView'),
          )
        }
        onStatusChange={(status) => {
          if (status === 'tracking' || status === 'missing')
            setCameraOptedIn(true);
          if (['idle', 'denied', 'error', 'unavailable'].includes(status))
            setCameraOptedIn(false);
        }}
        onContinueWithoutCamera={() => {
          setCameraOptedIn(false);
          finish();
        }}
      />
      <div className="story-actions">
        {stage >= 0 && !done && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => answer(steps[stage].gesture)}
          >
            Light the star
          </button>
        )}
        {done && (
          <button type="button" className="btn btn--primary" onClick={finish}>
            Start the story
          </button>
        )}
        <button type="button" className="btn btn--secondary" onClick={finish}>
          Skip warm-up
        </button>
      </div>
      <p>
        The camera is processed on this device. Nothing is recorded or uploaded.
      </p>
    </section>
  );
}
