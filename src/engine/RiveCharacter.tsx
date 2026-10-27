/* eslint-disable react-hooks/immutability -- Rive inputs are external mutable runtime objects updated in an effect. */
import { useEffect, useRef, useState } from 'react';
import {
  useRive,
  useStateMachineInput,
  RuntimeLoader,
} from '@rive-app/react-canvas';
import { JackActor } from '../rendering/storybook/cast';
import type { CharacterViewProps } from './Character';
RuntimeLoader.setWasmUrl('/rive/rive.wasm');
const MOOD: Record<string, number> = {
  idle: 0,
  happy: 1,
  scared: 2,
  casting: 3,
  reacting: 4,
};
export default function RiveCharacter({
  src,
  animation,
  personDetected = false,
  holdProgress = 0,
}: CharacterViewProps & { src: string }) {
  const [failed, setFailed] = useState(false);
  const { rive, RiveComponent } = useRive({
    src,
    stateMachines: 'StoryCharacter',
    autoplay: true,
    onLoadError: () => setFailed(true),
  });
  const mood = useStateMachineInput(rive, 'StoryCharacter', 'mood');
  const person = useStateMachineInput(rive, 'StoryCharacter', 'personDetected');
  const hold = useStateMachineInput(rive, 'StoryCharacter', 'holdProgress');
  const react = useStateMachineInput(rive, 'StoryCharacter', 'react');
  const previous = useRef(animation);
  useEffect(() => {
    if (mood) mood.value = MOOD[animation] ?? 0;
    if (person) person.value = personDetected;
    if (hold) hold.value = holdProgress;
    if (previous.current !== animation && animation === 'reacting')
      react?.fire();
    previous.current = animation;
  }, [mood, person, hold, react, animation, personDetected, holdProgress]);
  return failed ? (
    <svg viewBox="-150 -380 300 400" role="img" aria-label="Friendly Jack">
      <JackActor pose="idle" />
    </svg>
  ) : (
    <RiveComponent role="img" aria-label="Animated story character" />
  );
}
