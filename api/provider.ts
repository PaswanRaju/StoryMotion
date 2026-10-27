import { z } from 'zod';
import { DraftSchema } from '../src/generation/contract';
import type { GenerationRequest } from '../src/generation/contract';
import type { StoryProvider } from '../src/generation/service';
export class OpenAIStoryProvider implements StoryProvider {
  private readonly key: string;
  private readonly model: string;
  constructor(key: string, model = 'gpt-4o-mini') {
    this.key = key;
    this.model = model;
  }
  private async call(path: string, body: unknown) {
    const response = await fetch(`https://api.openai.com/v1/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.key}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) throw new Error('Story provider is unavailable');
    return response.json() as Promise<unknown>;
  }
  async generate(system: string, recipe: GenerationRequest, feedback: string) {
    const result = await this.call('responses', {
      model: this.model,
      store: false,
      max_output_tokens: 10000,
      input: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: JSON.stringify({
            selections: recipe,
            corrections: feedback,
          }),
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'story_draft',
          strict: true,
          schema: z.toJSONSchema(DraftSchema),
        },
      },
    });
    const output = z
      .object({
        output: z.array(
          z.object({
            content: z
              .array(
                z.object({ type: z.string(), text: z.string().optional() }),
              )
              .optional(),
          }),
        ),
      })
      .parse(result);
    const text = output.output
      .flatMap((item) => item.content ?? [])
      .filter((item) => item.type === 'output_text')
      .map((item) => item.text ?? '')
      .join('');
    return JSON.parse(text) as unknown;
  }
  async isSafe(text: string) {
    const result = await this.call('moderations', {
      model: 'omni-moderation-latest',
      input: text,
    });
    const parsed = z
      .object({ results: z.array(z.object({ flagged: z.boolean() })).min(1) })
      .parse(result);
    return parsed.results.every((result) => !result.flagged);
  }
}
