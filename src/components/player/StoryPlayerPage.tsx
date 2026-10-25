import { useEffect, useReducer, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStoryById } from '../../data/stories/registry';
import type { StorySummary } from '../../data/stories/registry';
import {
  animatedBeats,
  storyBeatIndex,
} from '../../data/stories/animatedBeats';
import { StoryNotFound } from '../library/StoryNotFound';
import { useSession } from '../../app/SessionContext';
import { routes } from '../../app/router';
import { PlayerToolbar } from './PlayerToolbar';
import { NarrationPanel } from './NarrationPanel';
import { GestureHint } from './GestureHint';
import { PauseDialog } from './PauseDialog';
import { GestureCamera } from '../gesture/GestureCamera';
import { AnimatedStoryScene } from '../../rendering/AnimatedStoryScene';
import {
  automaticStoryReducer,
  initialAutomaticStory,
  SCRIPTS,
} from '../../engine/automaticStory';
import type { MomentId } from '../../engine/automaticStory';
import type { BodyGesture } from '../../vision/bodyGestures';
import { playSfx, unlockSfx } from '../../audio/sfx';
import type { Sfx } from '../../audio/sfx';
import { useNarration } from '../../hooks/useNarration';
import { FINISH_CROSSED_MS } from '../../rendering/forest/timeline';
import { narrator } from '../../audio/narrator';
import './automaticStory.css';

export function StoryPlayerPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const story = storyId ? getStoryById(storyId) : undefined;
  return story ? (
    <AutomaticStoryPlayer key={story.id} story={story} />
  ) : (
    <StoryNotFound />
  );
}

function AutomaticStoryPlayer({ story }: { story: StorySummary }) {
  const navigate = useNavigate();
  const { characterId, audioEnabled, toggleAudio } = useSession();
  const [state, dispatch] = useReducer(
    automaticStoryReducer,
    story.id,
    initialAutomaticStory,
  );
  const MOMENTS = SCRIPTS[story.id].moments;
  const character =
    story.characters.find((candidate) => candidate.id === characterId) ??
    story.characters[0];
  const beat = storyBeatIndex(state.elapsed, story.id);
  const text = animatedBeats[story.id][beat];
  // A new id per beat and per restart: each line is spoken once, never per render.
  const [run, setRun] = useState(0);
  const replayNarration = useNarration(
    `${story.id}:${run}:${beat}`,
    text,
    audioEnabled,
    state.paused,
  );
  useEffect(() => {
    if (state.paused || state.finished) return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      dispatch({ type: 'TICK', ms: now - last });
      last = now;
    }, 200);
    return () => window.clearInterval(timer);
  }, [state.paused, state.finished]);
  useEffect(() => {
    if (state.finished) void navigate(routes.complete(story.id));
  }, [state.finished, navigate, story.id]);
  useEffect(() => {
    const hide = () => {
      if (document.hidden) dispatch({ type: 'PAUSE', paused: true });
    };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, []);
  const name = character.name;
  const open = state.interaction === 'open';
  // The gesture the camera is in the middle of recognizing ("Almost there…").
  const [forming, setForming] = useState<BodyGesture | null>(null);
  const momentId = MOMENTS[state.moment]?.id;
  const lastIndex = state.moment - 1;
  const lastMomentId = MOMENTS[lastIndex]?.id;
  const outcomes = state.responses.map((gesture, index) =>
    gesture ?? (state.auto[index] ? ('auto' as const) : null),
  );
  const lastOutcome = lastIndex >= 0 ? outcomes[lastIndex] : null;
  // Remember when the latest moment resolved, so its caption can retire after a while.
  const resolvedKey = `${run}:${lastIndex}`;
  const [resolved, setResolved] = useState({ key: '', at: 0 });
  if (lastIndex >= 0 && resolved.key !== resolvedKey)
    setResolved({ key: resolvedKey, at: state.elapsed });
  const freshOutcome =
    lastOutcome && state.elapsed < resolved.at + CAPTION_MS ? lastOutcome : null;
  // The narrator reacts once to each resolved moment (never restarting a story line).
  useEffect(() => {
    if (story.id === 'pigs') return;
    state.responses.forEach((gesture, index) => {
      const outcome = gesture ?? (state.auto[index] ? 'auto' : null);
      if (!outcome) return;
      const moment = MOMENTS[index].id;
      narrator.interject(
        `${story.id}:${run}:react:${moment}`,
        reaction(moment, outcome, name).spoken,
      );
    });
  }, [state.responses, state.auto, run, story.id, name, MOMENTS]);
  // Sound cues follow the mute toggle; speech and sounds are best effort.
  const sound = (cue: Sfx) => {
    playSfx(cue); // follows the global sound-effects switch
  };
  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
  });
  useEffect(() => {
    if (open) soundRef.current('invite');
  }, [open, state.moment]);
  useEffect(() => {
    if (state.gesture) soundRef.current(GESTURE_SFX[state.gesture]);
  }, [state.gesture, state.responses]);
  // Cinema mode: the scene, captions and invitation fill the screen together.
  const column = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenSupported =
    typeof document !== 'undefined' && document.fullscreenEnabled === true;
  useEffect(() => {
    const sync = () =>
      setIsFullscreen(document.fullscreenElement === column.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void column.current?.requestFullscreen().catch(() => {});
  };
  const restart = () => {
    dispatch({ type: 'RESTART' });
    setRun((value) => value + 1);
  };
  return (
    <section className="automatic-player" onPointerDown={unlockSfx}>
      <div inert={state.paused || undefined}>
        <PlayerToolbar
          title={story.title}
          chapterLabel={`Watching with ${character.name}`}
          muted={!audioEnabled}
          onToggleMute={toggleAudio}
          onPause={() => dispatch({ type: 'PAUSE', paused: true })}
          onRestart={restart}
        />
        <div className="player-layout">
          <div
            className={`story-column theater${open ? ' is-asking' : ''}${freshOutcome && freshOutcome !== 'auto' && !open ? ' is-celebrating' : ''}`}
            ref={column}
          >
            <div className="scene-frame">
              {fullscreenSupported && (
                <button
                  type="button"
                  className="scene-fullscreen"
                  aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize2 size={20} aria-hidden="true" />
                  ) : (
                    <Maximize2 size={20} aria-hidden="true" />
                  )}
                </button>
              )}
              <AnimatedStoryScene
                storyId={story.id}
                characterId={character.id}
                elapsed={state.elapsed}
                magic={state.magic}
                gesture={state.gesture}
                outcomes={outcomes}
                openMoment={open ? state.moment : null}
                onFinishLine={() => soundRef.current('finish')}
                paused={state.paused}
              />
              <div
                key={open ? `ask-${state.moment}` : `after-${state.moment}`}
                className={`magic-invitation ${open ? 'is-open' : ''}${!open && freshOutcome && freshOutcome !== 'auto' ? ' is-success' : ''}`}
                aria-live="polite"
              >
                {open && momentId ? (
                  <>
                    <div className="invite-head">
                      <GestureHint gesture={MOMENTS[state.moment].accepts[0]} />
                      <p>
                        <strong>{PROMPTS[momentId].title(name)}</strong>{' '}
                        <span className="invite-body">
                          {PROMPTS[momentId].body} You can just watch, too!
                        </span>
                      </p>
                    </div>
                    {forming && (
                      <p className="invite-almost" role="status">
                        Almost there…
                      </p>
                    )}
                    <div className="invite-timer" aria-hidden="true">
                      <span
                        style={{
                          width: `${(state.remaining / MOMENTS[state.moment].windowMs) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="story-actions">
                      {MOMENTS[state.moment].accepts.map((gesture) => (
                        <button
                          key={gesture}
                          data-sfx="none"
                          className="btn btn--secondary"
                          aria-label={buttonFor(momentId, gesture).label}
                          onClick={() =>
                            dispatch(
                              gesture === 'HAND_RAISE'
                                ? { type: 'MAGIC_ACTIVATE' }
                                : { type: gesture },
                            )
                          }
                        >
                          {buttonFor(momentId, gesture).text}
                          <small>{buttonFor(momentId, gesture).hint}</small>
                        </button>
                      ))}
                    </div>
                  </>
                ) : FINALE[story.id] && state.elapsed >= FINALE[story.id]!.atMs ? (
                  <p>
                    <strong>{FINALE[story.id]!.title}</strong> {FINALE[story.id]!.text}
                  </p>
                ) : freshOutcome && lastMomentId ? (
                  <p>
                    <strong>
                      {freshOutcome === 'auto' ? 'No problem!' : '✨ You did it!'}
                    </strong>{' '}
                    {reaction(lastMomentId, freshOutcome, name).caption}
                  </p>
                ) : (
                  <p>
                    {state.cameraBusy
                      ? 'Keep watching while your camera gets ready. A surprise can wait!'
                      : state.moment > 0
                        ? 'On with the adventure!'
                        : 'Sit back and enjoy. A little surprise is coming soon!'}
                  </p>
                )}
              </div>
            </div>
            <div className="theater-bottom">
              <NarrationPanel
                variant="subtitle"
                speaker="Narrator"
                text={text}
                onReplay={replayNarration}
              />
              <div className="camera-pip">
                <GestureCamera
                  onAction={dispatch}
                  onGesture={(event) => {
                    if (event.type !== 'HAND_RAISE') dispatch(event);
                  }}
                  onPending={setForming}
                  onStatusChange={(status) =>
                    dispatch({
                      type: 'CAMERA_BUSY',
                      busy: status === 'requesting' || status === 'loading',
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {state.paused && (
        <PauseDialog
          onResume={() => dispatch({ type: 'PAUSE', paused: false })}
          onReplayInstruction={() => {
            dispatch({ type: 'PAUSE', paused: false });
            replayNarration();
          }}
          onRestartStory={restart}
          onExitToLibrary={() => navigate(routes.library())}
        />
      )}
    </section>
  );
}

/** How long (story ms) a "You did it!" caption stays before the banner relaxes. */
const CAPTION_MS = 6000;
const GESTURE_SFX: Record<BodyGesture, Sfx> = {
  HAND_RAISE: 'magic',
  LEAN_LEFT: 'path',
  LEAN_RIGHT: 'path',
  ARMS_WIDE: 'shield',
  CROUCH: 'duck',
};
const ACTIONS: Record<BodyGesture, { label: string; text: string; hint: string }> = {
  ARMS_WIDE: { label: 'Use Magic', text: '🫧 Use Magic', hint: 'or spread your arms' },
  LEAN_LEFT: { label: 'Choose Left', text: '← 🌲 Choose Left', hint: 'or lean left' },
  LEAN_RIGHT: { label: 'Choose Right', text: 'Choose Right ☀️ →', hint: 'or lean right' },
  HAND_RAISE: { label: 'Give Boost', text: '✨ Give Boost', hint: 'or raise a hand' },
  CROUCH: { label: 'Duck', text: '⬇ Duck', hint: 'or bend your knees' },
};
const PROMPTS: Record<MomentId, { title: (name: string) => string; body: string }> = {
  shield: {
    title: (name) => `${name} needs your help!`,
    body: 'Spread your arms wide to make a magic shield!',
  },
  path: {
    title: (name) => `Which way should ${name} go?`,
    body: 'Lean left for the shady woods, or right for the sunny meadow!',
  },
  boost: {
    title: (name) => `Give ${name} one last boost!`,
    body: 'Raise a hand up high!',
  },
  grow: {
    title: (name) => `${name} needs some magic!`,
    body: 'Raise your hand to wake up the magic beans!',
  },
  dodge: {
    title: (name) => `Help ${name} choose a safe side!`,
    body: 'A tumbling cloud is coming down. Lean left or right!',
  },
  glide: {
    title: () => 'The giant is waking up!',
    body: 'Spread your arms wide to open a magic leaf glider!',
  },
};
/** Story-specific button wording; other moments use the generic ACTIONS labels. */
const MOMENT_BUTTONS: Partial<
  Record<MomentId, Partial<Record<BodyGesture, { label: string; text: string; hint: string }>>>
> = {
  grow: {
    HAND_RAISE: { label: 'Grow the Beanstalk', text: '🌱 Grow the Beanstalk', hint: 'or raise a hand' },
  },
  dodge: {
    LEAN_LEFT: { label: 'Move Left', text: '← Move Left', hint: 'or lean left' },
    LEAN_RIGHT: { label: 'Move Right', text: 'Move Right →', hint: 'or lean right' },
  },
  glide: {
    ARMS_WIDE: { label: 'Open the Glider', text: '🍃 Open the Glider', hint: 'or spread your arms' },
  },
};
const buttonFor = (moment: MomentId, gesture: BodyGesture) =>
  MOMENT_BUTTONS[moment]?.[gesture] ?? ACTIONS[gesture];
/** Caption once the story has reached its happy ending. */
const FINALE: Partial<Record<StorySummary['id'], { atMs: number; title: string; text: string }>> = {
  hare: { atMs: FINISH_CROSSED_MS, title: '🏁 What a race!', text: 'Slow and steady wins the day.' },
  beanstalk: { atMs: 46000, title: '🏡 Home sweet home!', text: 'A little courage can take you far.' },
};
/** What happened, for the caption under the scene and the narrator's one-line reaction. */
function reaction(
  moment: MomentId,
  outcome: BodyGesture | 'auto',
  name: string,
): { caption: string; spoken: string } {
  if (moment === 'shield')
    return outcome === 'auto'
      ? {
          caption: `${name} found another way — tucked in safe while the leaves blew past!`,
          spoken: `${name} tucked in safe, and the leaves whooshed right past.`,
        }
      : {
          caption: `Magic shield! The leaves bounce right off the bubble around ${name}.`,
          spoken: 'Wow! A magic shield! The leaves bounce right off!',
        };
  if (moment === 'grow')
    return outcome === 'auto'
      ? {
          caption: 'The magic beans woke up all by themselves!',
          spoken: 'The beans woke up all by themselves!',
        }
      : {
          caption: `Your magic made the beanstalk grow! Look at it go, ${name}!`,
          spoken: 'Whoosh! Your magic made the beanstalk grow!',
        };
  if (moment === 'dodge')
    return outcome === 'auto'
      ? {
          caption: `${name} found a safe side all by himself!`,
          spoken: `${name} found a safe side.`,
        }
      : {
          caption: `Great move! ${name} swings ${outcome === 'LEAN_LEFT' ? 'left' : 'right'} and the cloud tumbles past.`,
          spoken: 'Great move! The cloud tumbled right past!',
        };
  if (moment === 'glide')
    return outcome === 'auto'
      ? {
          caption: `${name} slid all the way down the beanstalk!`,
          spoken: `${name} slid down the beanstalk, quick and quiet.`,
        }
      : {
          caption: `A magic leaf glider! ${name} floats gently home.`,
          spoken: 'A magic leaf glider! Jack floats gently home.',
        };
  if (moment === 'path')
    return outcome === 'LEAN_LEFT'
      ? {
          caption: `Left path chosen! ${name} takes the cool, shady woods.`,
          spoken: 'The shady woods it is! Cool and green.',
        }
      : outcome === 'LEAN_RIGHT'
        ? {
            caption: `Right path chosen! ${name} takes the warm, sunny meadow.`,
            spoken: 'The sunny meadow it is! Warm and bright.',
          }
        : {
            caption: `${name} picked the sunny meadow. Off we go!`,
            spoken: `${name} picked the sunny meadow.`,
          };
  return outcome === 'auto'
    ? {
        caption: `${name} keeps going, steady and strong!`,
        spoken: `Steady and strong, ${name} keeps going!`,
      }
    : {
        caption: `A sparkly boost! ${name} zooms toward the finish.`,
        spoken: `Zoom! ${name} feels full of energy!`,
      };
}
