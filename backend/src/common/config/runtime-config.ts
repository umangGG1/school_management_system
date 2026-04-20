type MaybeString = string | undefined;

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function parseList(value: MaybeString): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getAllowedOrigins(): string[] {
  const configured = [
    ...parseList(process.env.FRONTEND_URLS),
    ...parseList(process.env.FRONTEND_URL),
  ].map(trimTrailingSlash);

  return Array.from(
    new Set([
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      ...configured,
    ]),
  );
}

export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;

  const normalizedOrigin = trimTrailingSlash(origin);

  return getAllowedOrigins().some((allowedOrigin) => {
    if (allowedOrigin.includes('*')) {
      const pattern = allowedOrigin
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');

      return new RegExp(`^${pattern}$`).test(normalizedOrigin);
    }

    return allowedOrigin === normalizedOrigin;
  });
}

export function getCorsOriginDelegate() {
  return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin ?? 'unknown'} is not allowed by CORS`));
  };
}

export function getDatabaseConfigFromEnv() {
  const databaseUrl = process.env.DATABASE_URL;
  const sslEnabled = process.env.DB_SSL === 'true';

  return {
    url: databaseUrl,
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME ?? 'smissi',
    username: process.env.DB_USER ?? 'smissi',
    password: process.env.DB_PASSWORD ?? 'smissi_dev',
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  };
}

export function getRedisConfigFromEnv() {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    return { url: redisUrl };
  }

  return {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
  };
}
