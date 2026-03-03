type HeadersLike =
  | Headers
  | Record<string, string | string[] | undefined>
  | undefined;

type RateLimitOptions = {
  key: string;
  windowMs: number;
  max: number;
  blockDurationMs?: number;
};

type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type RateLimitEntry = {
  hits: number[];
  blockedUntil: number;
};

const RATE_LIMIT_STORE_KEY = "__paperpair_rate_limit_store__";

function getStore() {
  const globalRef = globalThis as unknown as {
    [RATE_LIMIT_STORE_KEY]?: Map<string, RateLimitEntry>;
  };

  if (!globalRef[RATE_LIMIT_STORE_KEY]) {
    globalRef[RATE_LIMIT_STORE_KEY] = new Map<string, RateLimitEntry>();
  }

  return globalRef[RATE_LIMIT_STORE_KEY];
}

function normalizeHeaderValue(value: string | string[] | null | undefined) {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

function readHeader(headers: HeadersLike, key: string) {
  if (!headers) return "";
  if (headers instanceof Headers) {
    return headers.get(key) ?? "";
  }
  return normalizeHeaderValue(headers[key] ?? headers[key.toLowerCase()]);
}

export function getClientIpFromHeaders(headers: HeadersLike) {
  const forwardedFor = readHeader(headers, "x-forwarded-for")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (forwardedFor.length) {
    return forwardedFor[0];
  }

  const realIp = readHeader(headers, "x-real-ip").trim();
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

export function runRateLimit({
  key,
  windowMs,
  max,
  blockDurationMs = windowMs
}: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const store = getStore();
  const entry = store.get(key) ?? { hits: [], blockedUntil: 0 };

  if (entry.blockedUntil > now) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.blockedUntil - now) / 1000))
    };
  }

  const windowStart = now - windowMs;
  entry.hits = entry.hits.filter((hit) => hit > windowStart);

  if (entry.hits.length >= max) {
    entry.blockedUntil = now + blockDurationMs;
    store.set(key, entry);
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(blockDurationMs / 1000))
    };
  }

  entry.hits.push(now);
  entry.blockedUntil = 0;
  store.set(key, entry);

  if (store.size > 5000) {
    for (const [storeKey, storeEntry] of store) {
      const lastHit = storeEntry.hits.at(-1) ?? 0;
      if (storeEntry.blockedUntil <= now && lastHit < windowStart) {
        store.delete(storeKey);
      }
    }
  }

  return {
    ok: true,
    remaining: Math.max(0, max - entry.hits.length),
    retryAfterSeconds: 0
  };
}
