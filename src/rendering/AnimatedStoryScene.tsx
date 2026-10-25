import type { BodyGesture } from '../vision/bodyGestures';
import type { StoryId } from '../engine/types';
import { ForestRaceScene } from './forest/ForestRaceScene';
import { BeanstalkScene } from './beanstalk/BeanstalkScene';
import type { Outcome } from './forest/characterState';

function Pig({ x, y }: { x: number; y: number }) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      fill="#efa8ac"
      stroke="#a75d6a"
      strokeWidth="2"
    >
      <ellipse rx="23" ry="27" />
      <circle cy="-28" r="20" />
      <path d="M-17 -39l-3 -18 16 12M17 -39l3 -18 -16 12" />
      <ellipse cy="-24" rx="11" ry="7" fill="#e9899b" />
      <circle cx="-4" cy="-24" r="1.5" fill="#583342" />
      <circle cx="4" cy="-24" r="1.5" fill="#583342" />
      <circle cx="-8" cy="-34" r="2" fill="#583342" />
      <circle cx="8" cy="-34" r="2" fill="#583342" />
      <path d="M-12 23v10M12 23v10" strokeWidth="9" />
    </g>
  );
}

/** Always available vector animation: no speculative URLs, image loading, or video autoplay gate. */
export function AnimatedStoryScene({
  storyId,
  elapsed,
  magic,
  paused,
  gesture = null,
  characterId,
  outcomes,
  openMoment,
  onFinishLine,
}: {
  storyId: StoryId;
  elapsed: number;
  magic: boolean;
  paused: boolean;
  gesture?: BodyGesture | null;
  /** Gesture effects follow the child's chosen character where the scene has two actors. */
  characterId?: string;
  /** Per interaction moment: the gesture, 'auto' if it resolved itself, or null. */
  outcomes?: readonly (Outcome | null)[];
  openMoment?: number | null;
  onFinishLine?: () => void;
}) {
  if (storyId === 'hare')
    return (
      <ForestRaceScene
        elapsed={elapsed}
        magic={magic}
        paused={paused}
        gesture={gesture}
        characterId={characterId}
        outcomes={outcomes}
        openMoment={openMoment}
        onFinishLine={onFinishLine}
      />
    );
  if (storyId === 'beanstalk')
    return (
      <BeanstalkScene
        elapsed={elapsed}
        magic={magic}
        paused={paused}
        gesture={gesture}
        characterId={characterId}
        outcomes={outcomes}
        openMoment={openMoment}
        onFinishLine={onFinishLine}
      />
    );
  return (
    <BasicStoryScene
      storyId={storyId}
      elapsed={elapsed}
      magic={magic}
      paused={paused}
      gesture={gesture}
    />
  );
}

function BasicStoryScene({
  storyId,
  elapsed,
  magic,
  paused,
  gesture,
}: {
  storyId: Exclude<StoryId, 'hare'>;
  elapsed: number;
  magic: boolean;
  paused: boolean;
  gesture: BodyGesture | null;
}) {
  const pathOffset =
    gesture === 'LEAN_LEFT' ? -35 : gesture === 'LEAN_RIGHT' ? 15 : 0;
  const actorMotion = gesture === 'CROUCH' ? 'story-duck' : 'story-bob';
  const progress = Math.min(1, elapsed / 35000);
  return (
    <div
      className={`animated-story ${paused ? 'is-paused' : ''} ${magic ? 'has-magic' : ''} ${gesture ? `effect-${gesture.toLowerCase()}` : ''}`}
    >
      <svg
        viewBox="0 0 800 400"
        role="img"
        aria-label={
          storyId === 'beanstalk'
            ? 'Jack climbing a beanstalk into the clouds'
            : 'Three pigs building a strong brick house'
        }
      >
        <rect width="800" height="400" fill="#cde9ed" />
        <circle cx="705" cy="65" r="38" fill="#f5cf79" />
        <g fill="#fffaf0" className="story-cloud">
          <ellipse cx="140" cy="65" rx="70" ry="19" />
          <ellipse cx="120" cy="50" rx="35" ry="22" />
          <ellipse cx="515" cy="100" rx="60" ry="19" />
        </g>
        <path
          d="M0 230Q150 110 320 220Q580 110 800 225V400H0Z"
          fill="#a9d7a0"
        />
        <path
          d="M0 345Q400 245 800 330"
          fill="none"
          stroke="#eacfa5"
          strokeWidth="70"
        />
        {(gesture === 'LEAN_LEFT' || gesture === 'LEAN_RIGHT') && (
          <text x="30" y="45" fontSize="20" fill="#365a31">
            {gesture === 'LEAN_LEFT' ? '← Shady trail' : 'Sunny trail →'}
          </text>
        )}
        {storyId === 'beanstalk' && (
          <>
            <path
              d="M190 340Q340 220 440 30"
              fill="none"
              stroke="#59844c"
              strokeWidth="22"
            />
            {[0, 1, 2, 3, 4].map((i) => (
              <ellipse
                key={i}
                cx={240 + i * 42}
                cy={280 - i * 50}
                rx="44"
                ry="16"
                fill="#78aa62"
                transform={`rotate(${i % 2 ? -25 : 25} ${240 + i * 42} ${280 - i * 50})`}
              />
            ))}
            <g
              className="story-traveler"
              style={{
                transform: `translate(${210 + Math.sin(progress * Math.PI) * 220 + pathOffset}px, ${320 - Math.sin(progress * Math.PI) * 210}px)`,
              }}
            >
              <g className={actorMotion}>
                <circle cy="-40" r="17" fill="#dba57c" />
                <path
                  d="M0 -20v37M0 -5l-27 -20M0 -5l27 -25M0 17l-20 25M0 17l20 25"
                  fill="none"
                  stroke="#547e9b"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
              </g>
              {gesture === 'ARMS_WIDE' && (
                <ellipse
                  rx="55"
                  ry="70"
                  fill="#93c8e833"
                  stroke="#4388ac"
                  strokeWidth="4"
                />
              )}
              {magic && (
                <text x="30" y="-30" fontSize="35" fill="#b77516">
                  ✦
                </text>
              )}
            </g>
          </>
        )}
        {storyId === 'pigs' && (
          <>
            <g style={{ opacity: Math.min(1, elapsed / 16000) }}>
              <rect
                x="390"
                y="205"
                width="180"
                height="130"
                fill="#cf896b"
                stroke="#8f5e4b"
                strokeWidth="4"
              />
              {[230, 255, 280, 305].map((y) => (
                <path
                  key={y}
                  d={`M390 ${y}h180`}
                  stroke="#f4c5a5"
                  strokeWidth="3"
                />
              ))}
              <path d="M375 205l105 -85 105 85Z" fill="#9d5f57" />
              <rect
                x="455"
                y="270"
                width="40"
                height="65"
                rx="18"
                fill="#735446"
              />
              <rect x="410" y="230" width="30" height="30" fill="#cde9ed" />
            </g>
            <g
              className={actorMotion}
              style={{ translate: `${pathOffset}px 0` }}
            >
              <Pig x={170} y={310} />
              <Pig x={240} y={330} />
              <Pig x={310} y={310} />
            </g>
            {gesture === 'ARMS_WIDE' && (
              <ellipse
                cx="240"
                cy="300"
                rx="120"
                ry="65"
                fill="#93c8e833"
                stroke="#4388ac"
                strokeWidth="4"
              />
            )}
            {magic && (
              <text x="450" y="110" fontSize="45" fill="#b77516">
                ✦ ✧
              </text>
            )}
            {elapsed >= 28000 && elapsed < 35000 && (
              <path
                className="story-cloud"
                d="M620 230q60 -20 120 0M640 260h110"
                stroke="#fff"
                strokeWidth="6"
                fill="none"
              />
            )}
          </>
        )}
      </svg>
    </div>
  );
}
