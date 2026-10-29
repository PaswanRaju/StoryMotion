import { createHash } from 'node:crypto';
const buckets = new Map<string, { count: number; expires: number }>();
export async function allowGeneration(ip: string): Promise<boolean> {
  const key = `storymotion:${createHash('sha256')
    .update(`${process.env.RATE_LIMIT_SALT ?? 'local'}:${ip}`)
    .digest('hex')}`;
  const url = process.env.RATE_LIMIT_REDIS_REST_URL,
    token = process.env.RATE_LIMIT_REDIS_REST_TOKEN;
  if (url && token) {
    const response = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, 600, 'NX'],
      ]),
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) throw new Error('Rate limiter unavailable');
    const result: unknown = await response.json();
    if (!Array.isArray(result) || typeof result[0]?.result !== 'number')
      throw new Error('Rate limiter unavailable');
    return result[0].result <= 5;
  }
  if (process.env.NODE_ENV === 'production')
    throw new Error('Configure the distributed rate limiter');
  const now = Date.now();
  for (const [id, bucket] of buckets)
    if (bucket.expires <= now) buckets.delete(id);
  if (!buckets.has(key)) {
    if (buckets.size >= 1000) return false;
    buckets.set(key, { count: 0, expires: now + 600000 });
  }
  return ++buckets.get(key)!.count <= 5;
}
