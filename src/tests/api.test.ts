import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import handler from '../../api/generate-story';
const mocks = vi.hoisted(() => ({ allow: vi.fn(), generate: vi.fn() }));
vi.mock('../../api/rateLimit', () => ({ allowGeneration: mocks.allow }));
vi.mock('../generation/service', () => ({ generateStory: mocks.generate }));
vi.mock('../../api/provider', () => ({ OpenAIStoryProvider: class {} }));
const selections = {
  hero: 'jack',
  setting: 'meadow',
  lesson: 'kindness',
  age: '4–5',
  length: 'short',
  quiz: false,
  seed: 1,
  language: 'en',
};
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('OPENAI_API_KEY', 'test-server-secret');
  mocks.allow.mockResolvedValue(true);
  mocks.generate.mockResolvedValue({ id: 'safe-story' });
});
afterEach(() => vi.unstubAllEnvs());
async function request(body: unknown, method = 'POST') {
  const req = {
    body,
    method,
    headers: { host: 'localhost' },
    socket: { remoteAddress: '127.0.0.1' },
  } as unknown as Parameters<typeof handler>[0];
  const result = { statusCode: 0, setHeader: vi.fn(), end: vi.fn() };
  await handler(req, result as unknown as Parameters<typeof handler>[1]);
  return result;
}
it('returns only generated story data and never a server key', async () => {
  const result = await request(selections);
  expect(result.statusCode).toBe(200);
  expect(JSON.parse(result.end.mock.calls[0][0])).toEqual({
    story: { id: 'safe-story' },
    sourceToken: expect.any(String),
  });
  expect(result.end.mock.calls.flat().join()).not.toContain(
    'test-server-secret',
  );
});
it('rejects camera/audio/personal fields before reaching the provider', async () => {
  for (const extra of [{ landmarks: [] }, { audio: '' }, { name: 'private' }])
    expect((await request({ ...selections, ...extra })).statusCode).toBe(400);
  expect(mocks.generate).not.toHaveBeenCalled();
});
it('enforces HTTP method, distributed quota and missing provider configuration', async () => {
  expect((await request(selections, 'GET')).statusCode).toBe(405);
  mocks.allow.mockResolvedValue(false);
  expect((await request(selections)).statusCode).toBe(429);
  mocks.allow.mockResolvedValue(true);
  vi.stubEnv('OPENAI_API_KEY', '');
  expect((await request(selections)).statusCode).toBe(503);
  expect(mocks.generate).not.toHaveBeenCalled();
});
