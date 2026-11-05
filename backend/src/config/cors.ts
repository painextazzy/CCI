const PRODUCTION_FRONTEND_ORIGIN = 'https://2cci.vercel.app';

function normalizeOrigin(value: string) {
  try {
    return new URL(value.trim()).origin;
  } catch {
    return null;
  }
}

export function getAllowedFrontendOrigins() {
  const configuredOrigins = [
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
    process.env.CORS_ORIGINS,
  ]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => value.split(','))
    .map(normalizeOrigin)
    .filter((origin): origin is string => origin !== null);

  if (process.env.NODE_ENV !== 'production') {
    configuredOrigins.push('http://localhost:3000');
  }

  return [...new Set([...configuredOrigins, PRODUCTION_FRONTEND_ORIGIN])];
}
