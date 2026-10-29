import { assetRegistry, characterRegistry } from './registry';
import type { AssetProps } from './registry';
import type { CharacterAction, Scene } from './schema';
import { CastDefs } from '../rendering/storybook/cast';
import { useStoryClock } from '../rendering/storybook/clock';
import { usePreferences } from '../settings/preferences';
import { cameraAt } from './camera';
type Props = AssetProps & {
  scene: Scene;
  localMs: number;
  actions: CharacterAction[];
  personDetected?: boolean;
  holdProgress?: number;
};
export function SceneRenderer(props: Props) {
  const asset = assetRegistry[props.scene.background];
  const Background = asset.Component;
  return asset.composition ? (
    <Background {...props} />
  ) : (
    <GenericScene {...props} />
  );
}
function GenericScene({
  scene,
  localMs,
  actions,
  personDetected,
  holdProgress = 0,
  ...props
}: Props) {
  const { settings } = usePreferences();
  const { t } = useStoryClock(localMs, props.paused, props.openMoment !== null);
  const reduced =
    settings.reducedMotion ||
    (typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches);
  const camera = cameraAt(scene, t, reduced);
  const opacity = Math.min(
    1,
    scene.transitions.enterMs ? t / scene.transitions.enterMs : 1,
    scene.transitions.exitMs
      ? (scene.durationMs - t) / scene.transitions.exitMs
      : 1,
  );
  const Background = assetRegistry[scene.background].Component;
  return (
    <svg
      viewBox="0 0 1920 1080"
      role="img"
      aria-label={scene.title}
      style={{ opacity }}
    >
      <CastDefs />
      <g
        transform={`translate(${camera.shakeX} ${camera.shakeY}) translate(960 540) scale(${camera.zoom}) translate(-960 -540)`}
      >
        <g transform={`translate(${-camera.x} ${-camera.y})`}>
          <Background {...props} />
        </g>
        {(scene.layers ?? []).map((layer, index) => {
          const Layer = assetRegistry[layer.assetId].Component;
          return (
            <g
              key={index}
              transform={`translate(${(layer.x ?? 0) - camera.x * layer.speed} ${(layer.y ?? 0) - camera.y * layer.speed})`}
            >
              <Layer {...props} />
            </g>
          );
        })}
        <g transform={`translate(${-camera.x} ${-camera.y})`}>
          {scene.characters.map((initial) => {
            const character = [
              ...scene.actions.filter((action) => action.atMs <= t),
              ...actions,
            ]
              .filter((action) => action.characterId === initial.id)
              .reduce(
                (current, action) => ({ ...current, ...action }),
                initial,
              );
            const Character = characterRegistry[character.id].Component;
            return (
              <g
                key={character.id}
                transform={`translate(${character.x} ${character.y})`}
                data-anticipation={
                  personDetected
                    ? holdProgress
                      ? 'excited'
                      : 'watching'
                    : 'idle'
                }
              >
                <g
                  transform={
                    reduced ? undefined : `scale(${1 + holdProgress * 0.04})`
                  }
                >
                  <Character
                    animation={character.animation}
                    t={t}
                    personDetected={personDetected}
                    holdProgress={holdProgress}
                  />
                </g>
              </g>
            );
          })}
        </g>
      </g>
    </svg>
  );
}
