import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { validateStory } from '../src/engine/schema';
import type { Story } from '../src/engine/schema';
import {
  GenerationRequestSchema,
  generationCatalog,
} from '../src/generation/contract';
import type { GenerationRequest } from '../src/generation/contract';
export function signStory(
  story: Story,
  recipe: GenerationRequest,
  secret: string,
) {
  const payload = Buffer.from(JSON.stringify({ story, recipe })).toString(
    'base64url',
  );
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
}
export function verifyStory(token: string, secret: string) {
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra || token.length > 96000)
    throw new Error('Invalid source story');
  const actual = Buffer.from(signature, 'base64url'),
    expected = createHmac('sha256', secret).update(payload).digest();
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    throw new Error('Invalid source story');
  const parsed = z
    .object({ story: z.unknown(), recipe: GenerationRequestSchema })
    .parse(JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')));
  return {
    story: validateStory(parsed.story, generationCatalog),
    recipe: parsed.recipe,
  };
}
