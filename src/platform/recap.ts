import type { Story } from '../engine/schema';
import type { BodyGesture } from '../gestures';
export function storyRecap(
  story: Story,
  responses: readonly (BodyGesture | null)[],
  language: 'en' | 'es' = 'en',
) {
  const nodes = story.scenes.flatMap((scene) => scene.interactions);
  const answered = nodes.filter((_, index) => responses[index]);
  if (!answered.length)
    return language === 'es'
      ? '¡Viste una aventura completa y acompañaste a nuestros amigos!'
      : 'You watched a whole adventure and kept our friends company!';
  const shieldCount = answered.filter(
    (node) =>
      node.id === 'shield' || node.id === 'protect' || node.id === 'brace',
  ).length;
  const ending =
    story.id === 'beanstalk'
      ? 'helped Jack escape safely'
      : story.id === 'pigs'
        ? 'helped the little pigs reach safety'
        : story.id === 'hare'
          ? 'cheered for Tortoise and Hare'
          : 'helped our friends finish their adventure';
  if (language === 'es')
    return `¡Ayudaste a nuestros amigos con ${answered.length} momentos de magia!`;
  return shieldCount
    ? `You made ${shieldCount} magic ${shieldCount === 1 ? 'shield' : 'shields'} and ${ending}!`
    : `You ${ending}!`;
}
