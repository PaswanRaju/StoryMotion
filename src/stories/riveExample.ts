import type { Story } from '../engine/schema';
/** Artist preview; the SVG placeholder remains playable until a .riv path is configured. */
export const riveExample: Story = {
  id: 'rive-star-example',
  title: 'Jack and the Shared Star',
  description: 'A small Rive and camera demonstration.',
  coverAsset: 'space',
  ageRange: [4, 8],
  startSceneId: 'star-intro',
  scenes: [
    {
      id: 'star-intro',
      title: 'A friendly star',
      durationMs: 14000,
      background: 'space',
      layers: [{ assetId: 'clouds', speed: 0.25 }],
      cameraActions: [
        { type: 'pan', atMs: 0, durationMs: 12000, x: 100, y: 0 },
        { type: 'zoom', atMs: 0, durationMs: 10000, value: 1.08 },
      ],
      characters: [{ id: 'jack-rive', x: 960, y: 850, animation: 'idle' }],
      narration: [
        {
          atMs: 0,
          text: 'Jack found a little star that had lost its sparkle. His friends gathered around to help.',
        },
      ],
      actions: [
        { atMs: 4000, characterId: 'jack-rive', animation: 'scared' },
        { atMs: 6500, characterId: 'jack-rive', animation: 'casting' },
      ],
      soundEffects: [],
      transitions: { enterMs: 400, exitMs: 300 },
      events: ['intro', 'plot', 'climax'],
      interactions: [
        {
          id: 'light-star',
          atMs: 9500,
          gesture: 'raiseHand',
          windowMs: 8000,
          prompt: {
            title: 'Share a little sparkle!',
            body: 'Raise a hand to help Jack light the star.',
          },
          buttonLabel: 'Light the star',
          buttonText: 'Light the star',
          buttonHint: 'or raise a hand',
          alternatives: [],
          onSuccess: {
            actions: [{ characterId: 'jack-rive', animation: 'reacting' }],
            nextSceneId: null,
            caption: 'The star glowed with your kindness!',
            spoken: 'You shared a little sparkle!',
          },
          onTimeout: {
            actions: [{ characterId: 'jack-rive', animation: 'happy' }],
            nextSceneId: null,
            caption: 'The friends shared their own sparkle.',
            spoken: 'Together, the friends lit the star.',
          },
        },
      ],
      next: { type: 'scene', sceneId: 'star-ending' },
    },
    {
      id: 'star-ending',
      title: 'Kindness shines',
      durationMs: 10000,
      background: 'space',
      characters: [{ id: 'jack-rive', x: 960, y: 850, animation: 'happy' }],
      narration: [
        {
          atMs: 0,
          text: 'The star shone brightly again. Jack and his friends smiled. Sharing kindness makes every adventure brighter.',
        },
      ],
      actions: [],
      soundEffects: [{ atMs: 500, assetId: 'sparkle' }],
      transitions: { enterMs: 400, exitMs: 0 },
      interactions: [],
      events: ['conclusion', 'moral'],
      next: { type: 'ending' },
    },
  ],
};
