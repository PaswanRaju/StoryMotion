import { useCallback, useEffect, useRef, useState } from 'react';
import { createActor } from 'xstate';
import type { ActorRefFrom } from 'xstate';
import { initialPlayerContext, storyMachine } from './storyMachine';
import type { StoryEvent } from './storyMachine';
import type { Story } from './schema';

export function useStoryPlayer(story: Story) {
  const actor = useRef<ActorRefFrom<typeof storyMachine> | null>(null);
  const [state, setState] = useState(() => initialPlayerContext(story));
  useEffect(() => {
    const player = createActor(storyMachine, { input: { story } });
    actor.current = player;
    const subscription = player.subscribe((snapshot) =>
      setState(snapshot.context),
    );
    player.start();
    return () => {
      subscription.unsubscribe();
      player.stop();
      actor.current = null;
    };
  }, [story]);
  const send = useCallback(
    (event: StoryEvent) => actor.current?.send(event),
    [],
  );
  return [state, send] as const;
}
