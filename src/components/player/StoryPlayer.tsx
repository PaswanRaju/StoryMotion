import { useEffect, useMemo, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { StorySummary } from '../../data/stories/registry';
import { SceneRenderer } from '../../engine/SceneRenderer';
import { useStoryPlayer } from '../../engine/useStoryPlayer';
import { allInteractions, currentScene } from '../../engine/storyMachine';
import { fromBodyGesture, toBodyGesture } from '../../engine/gestures';
import {
  assetRegistry,
  registryCatalog,
  narrationAudioRegistry,
  soundRegistry,
} from '../../engine/registry';
import { validateStory } from '../../engine/schema';
import type { Story, InteractionNode, Outcome } from '../../engine/schema';
import { storyRecap } from '../../platform/recap';
import { completeStory } from '../../platform/storage';
import { useI18n } from '../../i18n';
import { usePreferences } from '../../settings/preferences';
import { useSession } from '../../app/SessionContext';
import { routes } from '../../app/router';
import { PlayerToolbar } from './PlayerToolbar';
import { NarrationPanel } from './NarrationPanel';
import { GestureHint } from './GestureHint';
import { PauseDialog } from './PauseDialog';
import { GestureCamera } from '../gesture/GestureCamera';
import type { BodyGesture } from '../../vision/bodyGestures';
import { playSfx, unlockSfx } from '../../audio/sfx';
import type { Sfx } from '../../audio/sfx';
import { useNarration } from '../../hooks/useNarration';
import { narrator } from '../../audio/narrator';
import './automaticStory.css';

export function StoryPlayer({
  story: input,
  summary,
  onComplete,
}: {
  story: Story;
  summary?: Pick<StorySummary, 'characters' | 'moral'>;
  onComplete?: () => void;
}) {
  const story = useMemo(() => validateStory(input, registryCatalog), [input]);
  const navigate = useNavigate();
  const { settings, update: updatePreferences } = usePreferences();
  const { t } = useI18n();
  const {
    characterId,
    audioEnabled,
    toggleAudio,
    cameraOptedIn,
    setCameraOptedIn,
  } = useSession();
  const [state, dispatch] = useStoryPlayer(story);
  const MOMENTS = useMemo(
    () =>
      allInteractions(story).map((node) => ({
        ...node,
        accepts: [
          node.gesture,
          ...node.alternatives.map((alt) => alt.gesture),
        ].map(toBodyGesture),
      })),
    [story],
  );
  const characters =
    summary?.characters ??
    story.scenes[0].characters.map((cast) => ({ id: cast.id, name: cast.id }));
  const character = characters.find(
    (candidate) => candidate.id === characterId,
  ) ??
    characters[0] ?? { id: '', name: 'Your friend' };
  const active = { scene: currentScene(state), local: state.localMs };
  const line =
    active.scene.narration.findLast((line) => line.atMs <= active.local) ??
    active.scene.narration[0];
  const translated = line.translations?.[settings.language];
  const text = translated?.text ?? line.text;
  const lastScene = active.scene.next.type === 'ending';
  // A new id per scene and per restart: each line is spoken once, never per render.
  const [run, setRun] = useState(0);
  const { replay: replayNarration, getCharIndex } = useNarration(
    `${story.id}:${run}:${active.scene.id}:${line.atMs}`,
    text,
    audioEnabled,
    state.paused,
    narrationAudioRegistry[translated?.audioAsset ?? line.audioAsset ?? ''],
    line.wordTimings,
    translated ? settings.language : (story.language ?? 'en'),
  );
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const quiz = state.finished ? story.quiz?.[quizIndex] : undefined;
  const quizGestures = useMemo<BodyGesture[]>(() => ['HAND_RAISE'], []);
  const completedRun = useRef('');
  useEffect(() => {
    if (
      state.finished &&
      !quiz &&
      completedRun.current !== `${story.id}:${run}`
    ) {
      completedRun.current = `${story.id}:${run}`;
      const recap = storyRecap(story, state.responses, settings.language);
      void completeStory({
        storyId: story.id,
        title: story.title,
        recap,
      }).catch(() => {});
      onComplete?.();
    }
  }, [
    state.finished,
    state.responses,
    onComplete,
    story.id,
    story.title,
    summary?.moral,
    quiz,
    run,
    story,
    settings.language,
  ]);
  useEffect(() => {
    if (!quiz || state.paused) return;
    narrator.instruct(
      `${story.id}:${run}:quiz:${quizIndex}`,
      `${quiz.question} Left hand for ${quiz.choices[0]}. Right hand for ${quiz.choices[1]}. You can tap, too.`,
    );
    const timer = setTimeout(
      () => setQuizAnswer(quiz.choices[quiz.answer]),
      10000,
    );
    return () => clearTimeout(timer);
  }, [quiz, quizIndex, story.id, run, state.paused]);
  useEffect(() => {
    if (!quizAnswer || state.paused) return;
    narrator.interject(
      `${story.id}:${run}:quiz-answer:${quizIndex}`,
      `Let's remember: ${quizAnswer}`,
    );
    const timer = setTimeout(() => {
      setQuizAnswer(null);
      setQuizIndex((prev) => prev + 1);
    }, 1500);
    return () => clearTimeout(timer);
  }, [quizAnswer, quizIndex, story.id, run, state.paused]);
  useEffect(() => {
    const hide = () => {
      if (document.hidden) dispatch({ type: 'PAUSE', paused: true });
    };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, [dispatch]);
  const name = character.name;
  const open = state.interaction === 'open';
  // The gesture the camera is in the middle of recognizing ("Almost there…").
  const [buddyHost, setBuddyHost] = useState<HTMLDivElement | null>(null);
  const [poseFeedback, setPoseFeedback] = useState({
    detected: false,
    progress: 0,
  });
  const [forming, setForming] = useState<BodyGesture | null>(null);
  const momentId = MOMENTS[state.moment]?.id;
  const lastIndex = state.moment - 1;
  const lastMomentId = MOMENTS[lastIndex]?.id;
  const outcomes = state.responses.map(
    (gesture, index) =>
      gesture ?? (state.auto[index] ? ('auto' as const) : null),
  );
  const lastOutcome = lastIndex >= 0 ? outcomes[lastIndex] : null;
  // Remember when the latest moment resolved, so its caption can retire after a while.
  const resolvedKey = `${run}:${lastIndex}`;
  const [resolved, setResolved] = useState({ key: '', at: 0 });
  if (lastIndex >= 0 && resolved.key !== resolvedKey)
    setResolved({ key: resolvedKey, at: state.elapsed });
  const freshOutcome =
    lastOutcome && state.elapsed < resolved.at + CAPTION_MS
      ? lastOutcome
      : null;
  // The narrator reacts once to each resolved moment (never restarting a story line).
  // Moments are scheduled after their scene's narration, so a reaction never cuts it off.
  useEffect(() => {
    state.responses.forEach((gesture, index) => {
      const outcome = gesture ?? (state.auto[index] ? 'auto' : null);
      if (!outcome) return;
      const moment = MOMENTS[index].id;
      narrator.interject(
        `${story.id}:${run}:react:${moment}`,
        fill(outcomeFor(MOMENTS[index], outcome).spoken, name),
      );
    });
  }, [state.responses, state.auto, run, story.id, name, MOMENTS]);
  useEffect(() => {
    const node = open ? MOMENTS[state.moment] : undefined;
    if (node)
      narrator.instruct(
        `${story.id}:${run}:prompt:${node.id}`,
        fill(`${node.prompt.title} ${node.prompt.body}`, name),
      );
  }, [open, MOMENTS, state.moment, story.id, run, name]);
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
  const playedCues = useRef(new Set<string>());
  useEffect(() => {
    if (state.paused || assetRegistry[active.scene.background].composition)
      return;
    for (const [index, cue] of active.scene.soundEffects.entries()) {
      const key = `${run}:${active.scene.id}:${index}`;
      if (cue.atMs <= active.local && !playedCues.current.has(key)) {
        playedCues.current.add(key);
        playSfx(soundRegistry[cue.assetId]);
      }
    }
  }, [active.scene, active.local, state.paused, run]);
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
    setQuizIndex(0);
    setQuizAnswer(null);
    setRun((value) => value + 1);
  };
  return (
    <section className="automatic-player" onPointerDown={unlockSfx}>
      {settings.classroom && (
        <nav className="teacher-controls" aria-label="Teacher controls">
          <button
            className="btn"
            onClick={() => dispatch({ type: 'PAUSE', paused: !state.paused })}
          >
            {t('pause')}
          </button>
          <button
            className="btn"
            onClick={() => dispatch({ type: 'SKIP_SCENE' })}
          >
            {t('skip')}
          </button>
          <button
            className="btn"
            onClick={() => {
              dispatch({ type: 'REPLAY_SCENE' });
              replayNarration();
            }}
          >
            {t('replay')}
          </button>
          <button
            className="btn"
            aria-pressed={settings.camera}
            onClick={() => updatePreferences({ camera: !settings.camera })}
          >
            {t('camera')}
          </button>
        </nav>
      )}
      <div inert={state.paused || undefined}>
        <PlayerToolbar
          title={story.title}
          chapterLabel={active.scene.title}
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
              <div className="buddy-corner" ref={setBuddyHost} />
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
              <SceneRenderer
                scene={active.scene}
                localMs={active.local}
                actions={state.characterActions}
                personDetected={poseFeedback.detected}
                holdProgress={open ? poseFeedback.progress : 0}
                characterId={character.id}
                elapsed={state.elapsed}
                magic={state.magic}
                gesture={state.gesture}
                outcomes={outcomes}
                openMoment={open ? state.moment : null}
                onFinishLine={() => soundRef.current('finish')}
                paused={state.paused}
              />
              {freshOutcome &&
                freshOutcome !== 'auto' &&
                !settings.reducedMotion && (
                  <div
                    key={resolvedKey}
                    className="feedback-particles"
                    aria-hidden="true"
                  >
                    {Array.from({ length: 12 }, (_, index) => (
                      <span
                        key={index}
                        style={
                          {
                            '--angle': `${index * 30}deg`,
                          } as React.CSSProperties
                        }
                      >
                        ✦
                      </span>
                    ))}
                  </div>
                )}
              <div
                key={open ? `ask-${state.moment}` : `after-${state.moment}`}
                className={`magic-invitation ${open ? 'is-open' : ''}${!open && freshOutcome && freshOutcome !== 'auto' ? ' is-success' : ''}${lastScene && !open && !quiz ? ' is-quiet' : ''}`}
                aria-live="polite"
              >
                {quiz ? (
                  <div className="comprehension-quiz">
                    <h3>{quiz.question}</h3>
                    <p>
                      {quizAnswer
                        ? `Let's remember: ${quizAnswer}`
                        : 'Raise your left hand for A or right hand for B, or tap.'}
                    </p>
                    <div className="story-actions">
                      {quiz.choices.map((choice, index) => (
                        <button
                          type="button"
                          className="btn btn--secondary"
                          disabled={!!quizAnswer}
                          key={index}
                          onClick={() => {
                            playSfx('recognized');
                            setQuizAnswer(quiz.choices[quiz.answer]);
                          }}
                        >
                          {index === 0 ? 'A' : 'B'}: {choice}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : open && momentId ? (
                  <>
                    {MOMENTS[state.moment].player && (
                      <p>
                        Explorer {MOMENTS[state.moment].player}, it is your
                        turn!
                      </p>
                    )}
                    <div className="invite-head">
                      {settings.seated &&
                      MOMENTS[state.moment].gesture === 'crouch' ? (
                        <span aria-hidden="true">✦</span>
                      ) : (
                        <GestureHint
                          gesture={MOMENTS[state.moment].accepts[0]}
                        />
                      )}
                      <p>
                        <strong>
                          {fill(MOMENTS[state.moment].prompt.title, name)}
                        </strong>{' '}
                        <span className="invite-body">
                          {MOMENTS[state.moment].prompt.body} You can just
                          watch, too!
                        </span>
                      </p>
                    </div>
                    {forming && (
                      <p className="invite-almost" role="status">
                        Almost there…
                      </p>
                    )}
                    <div
                      className="invitation-glow"
                      aria-hidden="true"
                      style={{
                        opacity:
                          0.2 +
                          (0.8 * state.remaining) /
                            MOMENTS[state.moment].windowMs,
                      }}
                    />
                    <div className="story-actions">
                      {MOMENTS[state.moment].accepts.map((gesture) => (
                        <button
                          key={gesture}
                          data-sfx="none"
                          className="btn btn--secondary"
                          aria-label={
                            buttonFor(MOMENTS[state.moment], gesture)
                              .buttonLabel
                          }
                          onClick={() =>
                            dispatch({
                              type: 'BUTTON',
                              gesture: fromBodyGesture(gesture),
                            })
                          }
                        >
                          {buttonFor(MOMENTS[state.moment], gesture).buttonText}
                          <small>
                            {
                              buttonFor(MOMENTS[state.moment], gesture)
                                .buttonHint
                            }
                          </small>
                        </button>
                      ))}
                    </div>
                  </>
                ) : lastScene ? (
                  // The picture shows its own "The End" card; keep the sky clear for it.
                  <p className="invite-quiet">{summary?.moral ?? text}</p>
                ) : freshOutcome && lastMomentId ? (
                  <p>
                    <strong>
                      {freshOutcome === 'auto'
                        ? 'No problem!'
                        : '✨ You did it!'}
                    </strong>{' '}
                    {fill(
                      outcomeFor(MOMENTS[lastIndex], freshOutcome).caption,
                      name,
                    )}
                  </p>
                ) : (
                  <p>
                    {state.cameraBusy
                      ? 'Keep watching while your camera gets ready. A surprise can wait!'
                      : state.moment > 0
                        ? t('onWith')
                        : t('waiting')}
                  </p>
                )}
              </div>
            </div>
            <div className="theater-bottom">
              {settings.captions && (
                <NarrationPanel
                  language={
                    translated ? settings.language : (story.language ?? 'en')
                  }
                  getCharIndex={getCharIndex}
                  variant="subtitle"
                  speaker={t('narrator')}
                  text={text}
                  onReplay={replayNarration}
                />
              )}
              <div className="camera-pip">
                <GestureCamera
                  autoStart={cameraOptedIn && settings.camera}
                  buddyContainer={buddyHost}
                  acceptedGestures={
                    quiz
                      ? quizGestures
                      : open
                        ? MOMENTS[state.moment].accepts
                        : undefined
                  }
                  activePlayer={open ? MOMENTS[state.moment].player : undefined}
                  onTracking={(tracking) =>
                    setPoseFeedback({
                      detected: tracking.upperBody,
                      progress: tracking.progress ?? 0,
                    })
                  }
                  recognitionEnabled={(open || !!quiz) && !state.paused}
                  onAction={(action) => {
                    if (quiz) {
                      if (
                        !quizAnswer &&
                        (action.hand === 'left' || action.hand === 'right')
                      ) {
                        playSfx('recognized');
                        setQuizAnswer(quiz.choices[quiz.answer]);
                      }
                    } else
                      dispatch({
                        type: 'GESTURE',
                        gesture: 'raiseHand',
                        player: action.player,
                      });
                  }}
                  onGesture={(event) => {
                    if (event.type !== 'HAND_RAISE')
                      dispatch({
                        type: 'GESTURE',
                        gesture: fromBodyGesture(event.type),
                        player: event.player,
                      });
                  }}
                  onPending={setForming}
                  onStatusChange={(status) => {
                    if (status === 'tracking' || status === 'missing')
                      setCameraOptedIn(true);
                    if (
                      ['idle', 'denied', 'error', 'unavailable'].includes(
                        status,
                      )
                    )
                      setCameraOptedIn(false);
                    dispatch({
                      type: 'CAMERA_BUSY',
                      busy: status === 'requesting' || status === 'loading',
                    });
                  }}
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
  BLOW: 'whoosh',
  CLIMB: 'sparkle',
  CLAP: 'recognized',
  RUN_IN_PLACE: 'cheer',
  HAND_RAISE: 'magic',
  LEAN_LEFT: 'path',
  LEAN_RIGHT: 'path',
  ARMS_WIDE: 'shield',
  CROUCH: 'duck',
};
const fill = (text: string, name: string) => text.replaceAll('{name}', name);
const buttonFor = (node: InteractionNode, body: BodyGesture) =>
  node.gesture === fromBodyGesture(body)
    ? node
    : node.alternatives.find((alt) => alt.gesture === fromBodyGesture(body))!;
const outcomeFor = (
  node: InteractionNode,
  outcome: BodyGesture | 'auto',
): Outcome =>
  outcome === 'auto' ? node.onTimeout : buttonFor(node, outcome).onSuccess;
