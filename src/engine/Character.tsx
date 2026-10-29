import { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';
import { JackActor } from '../rendering/storybook/cast';
export type CharacterAnimation =
  'idle' | 'happy' | 'scared' | 'casting' | 'reacting';
export interface Character {
  id: string;
  renderer: 'svg' | 'rive';
  states: readonly string[];
  animations: Readonly<Record<CharacterAnimation, string>>;
  Component: ComponentType<CharacterViewProps>;
}
export type CharacterViewProps = {
  animation: string;
  t: number;
  personDetected?: boolean;
  holdProgress?: number;
};
const RiveView = lazy(() => import('./RiveCharacter'));
/** Set a local .riv path when the artist's file is available. The placeholder stays playable. */
import { riveAssets } from './characterAssets';
export function RiveJack(props: CharacterViewProps) {
  const fallback = (
    <JackActor
      pose={
        props.holdProgress
          ? 'curious'
          : props.animation === 'happy' || props.animation === 'reacting'
            ? 'celebrate'
            : props.animation === 'casting'
              ? 'beans'
              : props.animation === 'scared'
                ? 'scared'
                : 'idle'
      }
    />
  );
  return riveAssets.jack ? (
    <foreignObject x="-150" y="-380" width="300" height="400">
      <Suspense fallback={<svg viewBox="-150 -380 300 400">{fallback}</svg>}>
        <RiveView {...props} src={riveAssets.jack} />
      </Suspense>
    </foreignObject>
  ) : (
    fallback
  );
}
