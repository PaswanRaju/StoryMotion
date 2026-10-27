import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { createPoseCamera } from '../../vision/poseCamera';
import type { TrackingStatus } from '../../vision/poseCamera';
import { BODY_GESTURES } from '../types';
import { GESTURE_CONFIG } from '../config';
import { PoseFixtureSchema } from '../fixtures';
import type { FixtureFrame, PoseFixture } from '../fixtures';

/** Only lazy-loaded by Vite's development route; normal playback has no capture callback. */
export function FixtureRecorderPage() {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<ReturnType<typeof createPoseCamera> | null>(null);
  const frames = useRef<FixtureFrame[]>([]);
  const firstAt = useRef<number | null>(null);
  const capturing = useRef(false);
  const [status, setStatus] = useState<TrackingStatus>('idle');
  const [recording, setRecording] = useState(false);
  const [count, setCount] = useState(0);
  const [label, setLabel] = useState<PoseFixture['label']>('HAND_RAISE');
  const [message, setMessage] = useState('');
  const stopRecording = () => {
    capturing.current = false;
    controller.current?.setRecordingEnabled(false);
    controller.current?.setRecognitionEnabled(false);
    setRecording(false);
  };
  const acceptFrame = useEffectEvent((frame: FixtureFrame) => {
    if (!capturing.current) return;
    firstAt.current ??= frame.atMs;
    const atMs = frame.atMs - firstAt.current;
    if (
      atMs >= GESTURE_CONFIG.recorder.maxDurationMs ||
      frames.current.length >= GESTURE_CONFIG.recorder.maxFrames
    ) {
      stopRecording();
      setMessage('Recording limit reached. Your fixture is ready to download.');
      return;
    }
    if (frames.current.length && atMs <= frames.current.at(-1)!.atMs) return;
    frames.current.push({
      ...frame,
      atMs,
      landmarks: frame.landmarks.map((point) => ({ ...point })),
    });
    setCount(frames.current.length);
  });
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    let mounted = true;
    const camera = createPoseCamera(video.current!, {
      recognitionEnabled: false,
      onAction: () => {},
      onStatus: (next) => {
        if (!mounted) return;
        setStatus(next);
        if (['idle', 'denied', 'error', 'unavailable'].includes(next)) {
          capturing.current = false;
          setRecording(false);
        }
      },
      onFixtureFrame: (frame) => acceptFrame(frame),
      onDebug: (frame) => {
        const target = canvas.current;
        if (!mounted || !target) return;
        const context = target.getContext('2d');
        if (!context) return;
        if (!frame) {
          context.clearRect(0, 0, target.width, target.height);
          return;
        }
        target.width = frame.width;
        target.height = frame.height;
        context.drawImage(frame, 0, 0);
      },
    });
    controller.current = camera;
    camera.setDebug(true);
    const stop = () => {
      capturing.current = false;
      camera.stop();
    };
    const hide = () => {
      if (document.hidden) stop();
    };
    window.addEventListener('pagehide', stop);
    document.addEventListener('visibilitychange', hide);
    return () => {
      mounted = false;
      stop();
      frames.current = [];
      controller.current = null;
      window.removeEventListener('pagehide', stop);
      document.removeEventListener('visibilitychange', hide);
    };
  }, []);
  if (!import.meta.env.DEV) return null;
  const ready = ['tracking', 'missing'].includes(status);
  const startRecording = () => {
    frames.current = [];
    firstAt.current = null;
    setCount(0);
    setMessage('');
    capturing.current = true;
    setRecording(true);
    controller.current?.setVisionOptions({
      allowed: label === 'neutral' ? undefined : [label],
    });
    controller.current?.setRecordingEnabled(true);
    controller.current?.setRecognitionEnabled(true);
  };
  const download = () => {
    const fixture = PoseFixtureSchema.parse({
      version: 1,
      label,
      mirrored: true,
      frames: frames.current,
    });
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(fixture, null, 2)], {
        type: 'application/json',
      }),
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `pose-${label.toLowerCase()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage('Downloaded locally. Nothing was uploaded.');
  };
  return (
    <section className="gesture-camera">
      <h1>Local gesture fixture recorder</h1>
      <p>
        Development tool for grown-ups. Start the camera, choose a label, and
        start recording. Stand relaxed for one second, make the gesture briefly,
        then relax again.
      </p>
      <p>
        Only landmark coordinates and timestamps enter the JSON file. Camera
        images are never recorded. Samples stay in this page until you download
        or clear them. Maximum: one minute.
      </p>
      <video ref={video} muted playsInline hidden aria-hidden="true" />
      <canvas
        ref={canvas}
        width={640}
        height={480}
        aria-label="Pose skeleton only"
        style={{ width: '100%', maxWidth: 640, background: '#1f2937' }}
      />
      <p role="status">
        Camera: {status}. {count} frames.{' '}
        {recording ? 'Recording locally…' : 'Recording stopped.'} {message}
      </p>
      <label>
        Gesture label{' '}
        <select
          value={label}
          disabled={recording}
          onChange={(event) =>
            setLabel(event.target.value as PoseFixture['label'])
          }
        >
          {[...BODY_GESTURES, 'neutral'].map((gesture) => (
            <option key={gesture} value={gesture}>
              {gesture}
            </option>
          ))}
        </select>
      </label>
      <div className="camera-controls">
        <button
          type="button"
          disabled={ready || status === 'requesting' || status === 'loading'}
          onClick={() => void controller.current?.start()}
        >
          Start camera
        </button>
        <button
          type="button"
          disabled={!ready || recording}
          onClick={startRecording}
        >
          Start recording
        </button>
        <button type="button" disabled={!recording} onClick={stopRecording}>
          Stop recording
        </button>
        <button type="button" disabled={!count || recording} onClick={download}>
          Download JSON
        </button>
        <button
          type="button"
          onClick={() => {
            stopRecording();
            frames.current = [];
            setCount(0);
            setMessage('Cleared.');
          }}
        >
          Clear samples
        </button>
        <button
          type="button"
          onClick={() => {
            stopRecording();
            controller.current?.stop();
          }}
        >
          Stop camera
        </button>
      </div>
    </section>
  );
}
