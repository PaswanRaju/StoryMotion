import type { StoryId } from '../../engine/types';
import { CastDefs, GoldenEgg, Hen, JackActor, Mother, Pig, Place } from '../../rendering/storybook/cast';
import '../../rendering/beanstalk/beanstalk.css';
import '../../rendering/storybook/storybook.css';

/** The happy ending cast on the completion screen (Jack's family, or all three pigs). */
export function CompletionCast({ storyId }: { storyId: StoryId }) {
  return (
    <div className="storybook-scene completion-cast" aria-hidden="true">
      <svg viewBox="0 0 900 380" role="presentation">
        <CastDefs />
        {storyId === 'beanstalk' ? (
          <>
            <Place x={300} y={370} scale={0.95}>
              <Mother pose="happy" />
            </Place>
            <Place x={470} y={370} scale={0.9}>
              <JackActor pose="celebrate" />
            </Place>
            <Place x={640} y={370} scale={1.3}>
              <Hen pose="flap" />
            </Place>
            <g transform="translate(730 345)">
              <GoldenEgg />
            </g>
          </>
        ) : (
          (['one', 'two', 'three'] as const).map((id, i) => (
            <Place key={id} x={260 + i * 190} y={370} scale={1.2}>
              <Pig id={id} pose="cheer" idle={i * 220} />
            </Place>
          ))
        )}
      </svg>
    </div>
  );
}
