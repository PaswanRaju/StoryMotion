import { useMemo } from 'react';
import { GestureCamera } from './GestureCamera';
import { useStoryPlayer } from '../../engine/useStoryPlayer';
import { stories } from '../../stories';
import { fromBodyGesture, toBodyGesture } from '../../engine/gestures';
import { allInteractions } from '../../engine/storyMachine';

const TRY: Record<string, { label: string; hint: string }> = {
  ARMS_WIDE: {
    label: 'Use Magic',
    hint: 'Spread your arms wide, or tap Use Magic.',
  },
  LEAN_LEFT: {
    label: 'Choose Left',
    hint: 'Lean left or right, or tap a path.',
  },
  LEAN_RIGHT: {
    label: 'Choose Right',
    hint: 'Lean left or right, or tap a path.',
  },
  HAND_RAISE: {
    label: 'Give Boost',
    hint: 'Raise one hand briefly, or tap Give Boost.',
  },
};
import './gestureDemo.css';

/** Diagnostic companion; the primary experience is now /library/hare/play. */
export function MagicGestureDemo() {
  const [state, dispatch] = useStoryPlayer(stories.hare);
  const MOMENTS = useMemo(
    () =>
      allInteractions(stories.hare).map((node) => ({
        ...node,
        accepts: [
          node.gesture,
          ...node.alternatives.map((alt) => alt.gesture),
        ].map(toBodyGesture),
      })),
    [],
  );
  const moment = MOMENTS[state.moment];
  const open = state.interaction === 'open' && moment;
  const answered = state.moment > 0 && state.responses[state.moment - 1];
  return (
    <main className="gesture-demo">
      <h1>Optional story magic</h1>
      <p>
        <a href="/library/hare/play">
          Watch the animated story with camera magic
        </a>
      </p>
      <p>
        This is the camera practice page. Three invitations open in turn: arms
        wide, a lean left or right, and a hand raise. Each waits a few seconds;
        doing nothing is fine.
      </p>
      <div className="magic-scene" aria-hidden="true">
        <span className={state.magic ? 'magic-sparkle' : ''}>✦</span>
      </div>
      <p role="status">
        {state.finished
          ? 'The story continued automatically. Our adventure carries on!'
          : open
            ? TRY[moment.accepts[0]].hint
            : answered
              ? '✨ You did it!'
              : 'The story is moving along…'}
      </p>
      {(open ? moment.accepts : (['ARMS_WIDE'] as const)).map((gesture) => (
        <button
          key={gesture}
          disabled={!open}
          onClick={() =>
            dispatch({ type: 'BUTTON', gesture: fromBodyGesture(gesture) })
          }
        >
          {TRY[gesture].label}
        </button>
      ))}{' '}
      <button onClick={() => dispatch({ type: 'RESTART' })}>
        Replay optional scene
      </button>
      <GestureCamera
        recognitionEnabled={!!open}
        onAction={() => dispatch({ type: 'GESTURE', gesture: 'raiseHand' })}
        onGesture={(event) => {
          if (event.type !== 'HAND_RAISE')
            dispatch({ type: 'GESTURE', gesture: fromBodyGesture(event.type) });
        }}
        onStatusChange={(status) =>
          dispatch({
            type: 'CAMERA_BUSY',
            busy: status === 'requesting' || status === 'loading',
          })
        }
      />
      <a href="/">Exit demo</a>
    </main>
  );
}
