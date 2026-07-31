export interface RateLimitProfile {
  windowMs: number;
  maxRequests: number;
  backoffMs: number;
  backoffFactor: number;
  maxBackoffMs: number;
}

export const RATE_LIMIT_PROFILES = {
  strict: {
    windowMs: 60 * 1000,
    maxRequests: 5,
    backoffMs: 30 * 1000,
    backoffFactor: 2,
    maxBackoffMs: 15 * 60 * 1000,
  },
  moderate: {
    windowMs: 60 * 1000,
    maxRequests: 20,
    backoffMs: 15 * 1000,
    backoffFactor: 2,
    maxBackoffMs: 5 * 60 * 1000,
  },
  relaxed: {
    windowMs: 60 * 1000,
    maxRequests: 60,
    backoffMs: 10 * 1000,
    backoffFactor: 2,
    maxBackoffMs: 60 * 1000,
  },
} as const satisfies Record<string, RateLimitProfile>;

type Bucket = {
  count: number;
  resetAt: number;
  blockedUntil: number;
  violations: number;
};

const buckets = new Map<string, Bucket>();

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export function rateLimit(
  key: string,
  profile: RateLimitProfile = RATE_LIMIT_PROFILES.relaxed
): { ok: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + profile.windowMs, blockedUntil: 0, violations: 0 };
    buckets.set(key, bucket);
  }

  if (bucket.blockedUntil > now) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((bucket.blockedUntil - now) / 1000),
    };
  }

  bucket.count += 1;

  if (bucket.count > profile.maxRequests) {
    const backoff = Math.min(
      profile.maxBackoffMs,
      profile.backoffMs * Math.pow(profile.backoffFactor, bucket.violations)
    );
    bucket.blockedUntil = now + backoff;
    bucket.violations += 1;
    bucket.resetAt = bucket.blockedUntil;
    return { ok: false, remaining: 0, retryAfter: Math.ceil(backoff / 1000) };
  }

  return { ok: true, remaining: profile.maxRequests - bucket.count, retryAfter: 0 };
}

export function rateLimitResponse(retryAfter: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(retryAfter),
      "X-RateLimit-Limit": "0",
      "X-RateLimit-Remaining": "0",
    },
  });
}

export function withRateLimit<T extends { ok: boolean; remaining: number; retryAfter: number }>(
  result: T,
  message: string,
  headers: HeadersInit = {}
): Response | null {
  if (result.ok) return null;
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(result.retryAfter),
      ...headers,
    },
  });
}
