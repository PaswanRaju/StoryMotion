import type { CameraPreviewState } from './CameraPreview';

type PoseStatusProps = {
  state: CameraPreviewState;
};

const STATUS_COPY: Record<CameraPreviewState, { text: string; tone: 'neutral' | 'good' | 'warn' }> = {
  idle: { text: 'Waiting for camera permission', tone: 'neutral' },
  requesting: { text: 'Asking your browser for camera access…', tone: 'neutral' },
  granted: { text: 'Camera ready — pose tracking arrives in Phase 05', tone: 'good' },
  denied: { text: 'Camera not available — manual mode will be used', tone: 'warn' },
  skipped: { text: 'Manual mode active — no camera needed', tone: 'good' },
};

export function PoseStatus({ state }: PoseStatusProps) {
  const { text, tone } = STATUS_COPY[state];
  const color =
    tone === 'good'
      ? 'var(--color-sage-dark)'
      : tone === 'warn'
        ? 'var(--color-danger)'
        : 'var(--color-text-muted)';

  return (
    <p role="status" style={{ color, fontWeight: 600, margin: 0 }}>
      {text}
    </p>
  );
}
