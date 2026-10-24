export type CameraPreviewState =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'skipped';

type CameraPreviewProps = {
  state: CameraPreviewState;
};

const MESSAGES: Record<CameraPreviewState, string> = {
  idle: 'Camera preview will appear here once you allow access.',
  requesting: 'Requesting camera access…',
  granted: 'Camera preview placeholder — live video + body tracking arrive in Phase 05.',
  denied: 'Camera access was not granted. You can still play using manual mode.',
  skipped: "You're playing without a camera — manual mode is ready.",
};

export function CameraPreview({ state }: CameraPreviewProps) {
  return (
    <div
      role="img"
      aria-label={MESSAGES[state]}
      style={{
        aspectRatio: '16 / 9',
        borderRadius: 'var(--radius-lg)',
        background:
          state === 'granted'
            ? 'linear-gradient(135deg, var(--color-sage), var(--color-sky))'
            : 'var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-5)',
        textAlign: 'center',
      }}
    >
      <p style={{ margin: 0, color: 'var(--color-cocoa-dark)', fontWeight: 600 }}>
        {MESSAGES[state]}
      </p>
    </div>
  );
}
