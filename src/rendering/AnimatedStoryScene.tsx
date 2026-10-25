import type { BodyGesture } from '../vision/bodyGestures';
import type { StoryId } from '../engine/types';
import { ForestRaceScene } from './forest/ForestRaceScene';
import { BeanstalkScene } from './beanstalk/BeanstalkScene';
import type { Outcome } from './forest/characterState';
import { StorybookScene } from './storybook/StorybookScene';
import {
  BEANSTALK_LEGACY_SCENES,
  beanstalkLegacyTime,
  forestTime,
  sceneAt,
  sceneIndexAt,
} from '../data/stories/scenes';

/**
 * Always available vector animation: no speculative URLs, image loading, or video
 * autoplay gate. `elapsed` is story time; each story maps it to its renderer.
 */
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
        elapsed={forestTime(elapsed)}
        beat={sceneIndexAt('hare', elapsed)}
        magic={magic}
        paused={paused}
        gesture={gesture}
        characterId={characterId}
        outcomes={outcomes}
        openMoment={openMoment}
        onFinishLine={onFinishLine}
      />
    );
  const active = sceneAt(storyId, elapsed);
  if (storyId === 'beanstalk' && isLegacyScene(active.scene.id)) {
    // Grow → climb → clouds keep the tall-world beanstalk renderer, which knows the
    // first two beanstalk moments (grow, dodge) by the same indexes.
    const { local, scene } = active;
    const fadeIn = scene.id === 'jack-grow' ? 1 - Math.min(1, local / 700) : 0;
    const fadeOut =
      scene.id === 'jack-clouds' ? Math.max(0, (local - (scene.durationMs - 450)) / 450) : 0;
    return (
      <BeanstalkScene
        elapsed={beanstalkLegacyTime(scene.id, local)}
        magic={magic}
        paused={paused}
        gesture={gesture}
        characterId={characterId}
        outcomes={outcomes?.slice(0, 2)}
        openMoment={openMoment != null && openMoment < 2 ? openMoment : null}
        overlay={Math.max(fadeIn, fadeOut)}
      />
    );
  }
  return (
    <StorybookScene
      storyId={storyId}
      elapsed={elapsed}
      paused={paused}
      outcomes={outcomes}
      openMoment={openMoment}
      magic={magic}
    />
  );
}

const isLegacyScene = (id: string) =>
  (BEANSTALK_LEGACY_SCENES as readonly string[]).includes(id);
