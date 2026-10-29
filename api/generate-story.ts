import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  GenerationEnvelopeSchema,
  GenerationRequestSchema,
} from '../src/generation/contract';
import { generateStory } from '../src/generation/service';
import { OpenAIStoryProvider } from './provider';
import { signStory, verifyStory } from './storyToken';
import { allowGeneration } from './rateLimit';
export const maxDuration = 180;
export default async function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  const send = (status: number, body: unknown) => {
    res.statusCode = status;
    res.end(JSON.stringify(body));
  };
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    send(405, { error: 'Use POST' });
    return;
  }
  try {
    if (
      req.headers.origin &&
      new URL(req.headers.origin).host !== req.headers.host
    ) {
      send(403, { error: 'This request is not allowed.' });
      return;
    }
    let body = req.body;
    if (body === undefined) {
      let raw = '';
      for await (const chunk of req) {
        raw += String(chunk);
        if (raw.length > 128000) {
          send(413, { error: 'Request too large' });
          return;
        }
      }
      body = JSON.parse(raw);
    }
    if (typeof body === 'string') body = JSON.parse(body);
    const parsed = GenerationEnvelopeSchema.safeParse(body);
    if (!parsed.success) {
      send(400, { error: 'Please choose from the story options.' });
      return;
    }
    const ip = String(
      req.headers['x-real-ip'] ?? req.socket.remoteAddress ?? 'local',
    );
    if (!(await allowGeneration(ip))) {
      res.setHeader('Retry-After', '600');
      send(429, {
        error: 'The story stars need a break. Try again in a little while.',
      });
      return;
    }
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      send(503, {
        error:
          'Story generation is not set up yet. The built-in stories are ready to play.',
      });
      return;
    }
    const secret = process.env.STORY_SIGNING_SECRET || key;
    let approved;
    try {
      approved = parsed.data.sourceToken
        ? verifyStory(parsed.data.sourceToken, secret)
        : undefined;
    } catch {
      send(400, {
        error:
          'Please open the original saved story to change its reading age.',
      });
      return;
    }
    const selections = GenerationRequestSchema.strip().parse(parsed.data);
    const source = approved?.story;
    if (
      approved &&
      (Object.keys(selections) as (keyof typeof selections)[]).some(
        (key) => key !== 'age' && selections[key] !== approved.recipe[key],
      )
    ) {
      send(400, {
        error: 'Keep the original story selections when changing reading age.',
      });
      return;
    }
    const story = await generateStory(
      selections,
      new OpenAIStoryProvider(key, process.env.STORY_MODEL),
      source,
    );
    send(200, { story, sourceToken: signStory(story, selections, secret) });
  } catch {
    send(503, {
      error: 'Our story stars need a little rest. Please try again later.',
    });
  }
}
