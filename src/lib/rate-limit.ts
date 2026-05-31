import { RateLimiterMemory } from "rate-limiter-flexible";

const limiters = new Map<string, RateLimiterMemory>();

function getLimiter(key: string, points: number, duration: number) {
  if (!limiters.has(key)) {
    limiters.set(
      key,
      new RateLimiterMemory({ points, duration, blockDuration: duration })
    );
  }
  return limiters.get(key)!;
}

export async function rateLimit(
  identifier: string,
  type: "api" | "auth" | "search" = "api"
): Promise<{ success: boolean; remaining?: number }> {
  const configs = {
    api: { points: 100, duration: 60 },
    auth: { points: 10, duration: 60 },
    search: { points: 30, duration: 60 },
  };
  const { points, duration } = configs[type];
  const limiter = getLimiter(type, points, duration);

  try {
    const res = await limiter.consume(identifier);
    return { success: true, remaining: res.remainingPoints };
  } catch {
    return { success: false };
  }
}
