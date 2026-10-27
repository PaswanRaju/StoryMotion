import { createPortal } from 'react-dom';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useI18n } from '../../i18n';
import { usePreferences } from '../../settings/preferences';
import { createPoseCamera } from '../../vision/poseCamera';
import type { TrackingStatus } from '../../vision/poseCamera';
import type {
  BodyGesture,
  BodyGestureEvent,
  BodyTracking,
} from '../../vision/bodyGestures';
import type { MagicAction } from '../../vision/magicGesture';
import { playSfx } from '../../audio/sfx';
import './gestureCamera.css';

const ALMOST: Record<BodyGesture, string> = {
  BLOW: 'A gentle puff… almost there!',
  CLIMB: 'Reaching up… almost there!',
  CLAP: 'Hands together… almost there!',
  RUN_IN_PLACE: 'Cheering… almost there!',
  HAND_RAISE: 'Hand going up… almost there!',
  LEAN_LEFT: 'Leaning… almost there!',
  LEAN_RIGHT: 'Leaning… almost there!',
  ARMS_WIDE: 'Arms opening… almost there!',
  CROUCH: 'Ducking… almost there!',
};

export function GestureCamera({
  onAction,
  onGesture,
  onStatusChange,
  onPending,
  recognitionEnabled = true,
  autoStart = false,
  onTracking,
  acceptedGestures,
  activePlayer,
  buddyContainer,
  onContinueWithoutCamera,
}: {
  buddyContainer?: Element | null;
  acceptedGestures?: readonly BodyGesture[];
  activePlayer?: 1 | 2;
  onTracking?: (tracking: BodyTracking) => void;
  onContinueWithoutCamera?: () => void;
  recognitionEnabled?: boolean;
  autoStart?: boolean;
  onAction: (action: MagicAction) => void;
  onGesture?: (event: BodyGestureEvent) => void;
  onStatusChange?: (status: TrackingStatus) => void;
  /** The gesture being recognized right now, or null. Changes only, not per frame. */
  onPending?: (gesture: BodyGesture | null) => void;
}) {
  const { settings } = usePreferences();
  const { t } = useI18n();
  const localizedMessages: Record<TrackingStatus, string> = {
    idle: t('cameraIdle'),
    requesting: t('cameraRequest'),
    loading: t('cameraLoading'),
    tracking: t('cameraReady'),
    missing: t('cameraMissing'),
    denied: t('cameraDenied'),
    error: t('cameraError'),
    unavailable: t('cameraUnavailable'),
  };
  const video = useRef<HTMLVideoElement>(null);
  const overlay = useRef<HTMLCanvasElement>(null);
  const shadow = useRef<HTMLCanvasElement>(null);
  const reportTracking = useEffectEvent((tracking: BodyTracking) =>
    onTracking?.(tracking),
  );
  const [showSkeleton, setShowSkeleton] = useState(false);
  const developerMode =
    new URLSearchParams(window.location.search).get('debugPose') === '1';
  const controller = useRef<ReturnType<typeof createPoseCamera> | null>(null);
  const [status, setStatus] = useState<TrackingStatus>('idle');
  const [tracking, setTracking] = useState<BodyTracking | null>(null);
  const [recognized, setRecognized] = useState('');
  const [fps, setFps] = useState(0);
  const visionOptions = useEffectEvent(() => ({
    allowed: acceptedGestures,
    activePlayer,
    seated: settings.seated,
    sensitivity:
      settings.sensitivity === 'gentle'
        ? 0.8
        : settings.sensitivity === 'deliberate'
          ? 1.2
          : 1,
    players: settings.coop ? (2 as const) : (1 as const),
  }));
  const enabled = useEffectEvent(() => recognitionEnabled);
  const emit = useEffectEvent((action: MagicAction) => {
    if (recognitionEnabled) onAction(action);
  });
  const pending = useEffectEvent((next: BodyGesture | null) =>
    onPending?.(next),
  );
  const gesture = useEffectEvent((event: BodyGestureEvent) => {
    if (!recognitionEnabled) return;
    const labels: Record<BodyGesture, string> = {
      BLOW: 'A gentle puff!',
      CLIMB: 'Climbing!',
      CLAP: 'A lovely clap!',
      RUN_IN_PLACE: 'Cheering!',
      HAND_RAISE: 'Hand raised!',
      LEAN_LEFT: 'Leaning left!',
      LEAN_RIGHT: 'Leaning right!',
      ARMS_WIDE: 'Arms wide — a shield!',
      CROUCH: 'A gentle duck!',
    };
    setRecognized(`✨ ${labels[event.type]}`);
    playSfx('recognized');
    onGesture?.(event);
  });
  const reportStatus = useEffectEvent((next: TrackingStatus) => {
    // Camera cues on real transitions only (status changes, never per frame).
    if (next === 'missing' && status === 'loading') playSfx('cameraOn');
    if (next === 'idle' && ['loading', 'tracking', 'missing'].includes(status))
      playSfx('cameraOff');
    setStatus(next);
    if (next === 'idle' || next === 'requesting') {
      setTracking(null);
      setRecognized('');
      pending(null);
    }
    onStatusChange?.(next);
  });
  useEffect(() => {
    let mounted = true;
    let lastPending: BodyGesture | null = null;
    let frames = 0;
    let windowStart = performance.now();
    const camera = createPoseCamera(video.current!, {
      recognitionEnabled: enabled(),
      vision: visionOptions(),
      onAction: (action) => emit(action),
      onGesture: (event) => {
        if (mounted) gesture(event);
      },
      onShadow: (frame) => {
        const canvas = shadow.current;
        const context = canvas?.getContext('2d');
        if (!mounted || !canvas || !context) return;
        if (!frame) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }
        canvas.width = frame.width;
        canvas.height = frame.height;
        context.drawImage(frame, 0, 0);
      },
      onDebug: (frame) => {
        const canvas = overlay.current;
        if (!mounted || !canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        if (!frame) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }
        canvas.width = frame.width;
        canvas.height = frame.height;
        context.drawImage(frame, 0, 0);
      },
      onTracking: (next) => {
        if (!mounted) return;
        setTracking(next);
        reportTracking(next);
        const now = performance.now();
        frames++;
        if (now - windowStart >= 1000) {
          setFps(Math.round((frames * 1000) / (now - windowStart)));
          frames = 0;
          windowStart = now;
        }
        const current = next.pending ?? null;
        if (current !== lastPending) {
          lastPending = current;
          pending(current);
        }
      },
      onStatus: (next) => {
        if (mounted) reportStatus(next);
      },
    });
    controller.current = camera;
    const stop = () => camera.stop();
    const hide = () => {
      if (document.hidden) stop();
    };
    window.addEventListener('pagehide', stop);
    document.addEventListener('visibilitychange', hide);
    return () => {
      mounted = false;
      window.removeEventListener('pagehide', stop);
      document.removeEventListener('visibilitychange', hide);
      camera.stop();
      controller.current = null;
    };
  }, []);
  useEffect(() => {
    if (autoStart) void controller.current?.start();
  }, [autoStart]);
  useEffect(() => {
    controller.current?.setRecognitionEnabled?.(recognitionEnabled);
  }, [recognitionEnabled]);
  const previousCamera = useRef(settings.camera);
  useEffect(() => {
    if (!settings.camera) controller.current?.stop();
    else if (!previousCamera.current) void controller.current?.start();
    previousCamera.current = settings.camera;
  }, [settings.camera]);
  useEffect(() => {
    controller.current?.setVisionOptions?.(visionOptions());
  }, [acceptedGestures, activePlayer, settings]);
  const running = ['requesting', 'loading', 'tracking', 'missing'].includes(
    status,
  );
  const buddy = (
    <div
      className={`shadow-buddy${recognitionEnabled ? ' is-awake' : ''}`}
      aria-label="Your glowing shadow buddy"
      hidden={!running}
    >
      {running && recognitionEnabled && tracking?.pending && (
        <svg
          className="gesture-hold-ring"
          viewBox="0 0 40 40"
          role="progressbar"
          aria-label="Gesture hold progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round((tracking.progress ?? 0) * 100)}
        >
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            opacity="0.2"
            strokeWidth="4"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            pathLength="1"
            strokeDasharray={`${tracking.progress ?? 0} 1`}
            transform="rotate(-90 20 20)"
          />
        </svg>
      )}
      <canvas
        ref={shadow}
        width="320"
        height="240"
        aria-label="Your pose skeleton"
      />
      <span aria-hidden="true" className="shadow-buddy__smile">
        ✦
      </span>
    </div>
  );
  return (
    <aside
      className={`gesture-camera${running ? ' is-running' : ''}${status === 'tracking' && tracking?.upperBody ? ' is-tracking' : ''}`}
      aria-label="Optional camera"
    >
      <h3>
        <span className="gesture-camera__dot" aria-hidden="true" />
        Your camera
      </h3>
      <div className="camera-preview" hidden={!running}>
        <video
          ref={video}
          hidden
          style={{ display: 'none' }}
          muted
          playsInline
          aria-label="Local camera preview"
        />
        <canvas
          ref={overlay}
          aria-label="Developer pose skeleton"
          hidden={!developerMode || !showSkeleton || !running}
        />
      </div>
      {buddyContainer ? createPortal(buddy, buddyContainer) : buddy}
      <p role="status">
        {running &&
        !recognitionEnabled &&
        !['requesting', 'loading'].includes(status)
          ? 'Camera ready. Watch the story until it is time to move!'
          : localizedMessages[status]}
      </p>
      {running && tracking?.upperBody && !tracking.calibrated && (
        <p>We can see you! Relax your arms for a moment.</p>
      )}
      {running && tracking?.upperBody && tracking.calibrated && (
        <p>
          {tracking.crouchAvailable
            ? 'Full body detected — every move works!'
            : "Upper body detected — that's enough! Use the button for crouching."}
        </p>
      )}
      {running && recognitionEnabled && tracking?.pending && (
        <p className="gesture-almost">{ALMOST[tracking.pending]}</p>
      )}
      {!!tracking?.unavailable?.length && (
        <p role="status">That move is resting. Tap the story button to help!</p>
      )}
      {recognized && (
        <p role="status">
          <strong>{recognized}</strong>
        </p>
      )}
      <div className="camera-controls">
        <button
          className="btn btn--secondary"
          disabled={running || !settings.camera}
          onClick={() => void controller.current?.start()}
        >
          {t('startCamera')}
        </button>
        {running && (
          <button
            className="btn btn--ghost"
            onClick={() => controller.current?.stop()}
          >
            {t('stopCamera')}
          </button>
        )}
      </div>
      {['requesting', 'loading'].includes(status) && (
        <div className="camera-loading" role="status">
          <span aria-hidden="true">✦</span> Waking up your star buddy…
        </div>
      )}
      {['denied', 'error', 'idle', 'unavailable'].includes(status) && (
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => {
            controller.current?.stop();
            onContinueWithoutCamera?.();
          }}
        >
          {t('continue')}
        </button>
      )}
      <p className="camera-privacy">{t('privacy')}</p>
      {developerMode && (
        <details className="pose-debug-controls">
          <summary>Developer tracking</summary>
          <label>
            <input
              type="checkbox"
              checked={showSkeleton}
              onChange={(event) => {
                const enabled = event.target.checked;
                setShowSkeleton(enabled);
                controller.current?.setDebug(enabled);
              }}
            />{' '}
            Show skeleton
          </label>
          <dl className="pose-debug-stats">
            <dt>Inference</dt>
            <dd>{running ? `${fps} fps` : 'off'}</dd>
            <dt>Landmarks</dt>
            <dd>{tracking?.landmarkCount ?? 0}</dd>
            <dt>Confidence</dt>
            <dd>{tracking?.confidence?.toFixed(2) ?? '—'}</dd>
            <dt>Body</dt>
            <dd>
              {!tracking?.upperBody
                ? 'not found'
                : tracking.legsVisible
                  ? 'full body'
                  : 'upper body'}
              {tracking?.calibrated ? ', calibrated' : ''}
              {tracking?.crouchAvailable ? ', crouch on' : ''}
            </dd>
            <dt>Head</dt>
            <dd>{tracking?.headDirection ?? '—'}</dd>
            <dt>Forming</dt>
            <dd>
              {recognitionEnabled && tracking?.pending
                ? `${tracking.pending} ${Math.round((tracking.progress ?? 0) * 100)}%`
                : '—'}
            </dd>
            <dt>Last event</dt>
            <dd>{recognized || '—'}</dd>
          </dl>
          <p>
            Joint numbers are shown only in this local preview. No recording or
            saving.
          </p>
        </details>
      )}
      <small>
        Only on this device. No recording or uploads. Sitting is fine!
      </small>
    </aside>
  );
}
