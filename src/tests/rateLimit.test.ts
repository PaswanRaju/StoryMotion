import { afterEach, expect, it, vi } from 'vitest';
import { allowGeneration } from '../../api/rateLimit';
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it('limits local development requests and requires shared rate limiting in production', async () => {
  vi.stubEnv('NODE_ENV', 'development');
  vi.stubEnv('RATE_LIMIT_REDIS_REST_URL', '');
  for (let index = 0; index < 5; index++)
    expect(await allowGeneration('synthetic-test-ip')).toBe(true);
  expect(await allowGeneration('synthetic-test-ip')).toBe(false);
  vi.stubEnv('NODE_ENV', 'production');
  await expect(allowGeneration('other-test-ip')).rejects.toThrow(/distributed/);
});
it('uses hashed quota keys and fails closed on Redis errors', async () => {
  vi.stubEnv('RATE_LIMIT_REDIS_REST_URL', 'https://redis.example');
  vi.stubEnv('RATE_LIMIT_REDIS_REST_TOKEN', 'test-token');
  const fetcher = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [{ result: 6 }, { result: 1 }],
  });
  vi.stubGlobal('fetch', fetcher);
  expect(await allowGeneration('private-ip')).toBe(false);
  expect(fetcher.mock.calls[0][1].body).not.toContain('private-ip');
  fetcher.mockResolvedValue({ ok: false });
  await expect(allowGeneration('test')).rejects.toThrow(/unavailable/);
});
