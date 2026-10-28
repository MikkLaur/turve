import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const nodeEnv = process.env.NODE_ENV || 'production';
const isLocalDev = nodeEnv === 'development' || nodeEnv === 'test';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable must be set.`);
  }
  return value;
}

/** Local dev/test get fixed throwaway values so the app starts without a full .env. Production must set them. */
function secretEnv(name: string, devFallback: string): string {
  const value = process.env[name];
  if (value) {
    return value;
  }
  if (isLocalDev) {
    return devFallback;
  }
  throw new Error(`${name} environment variable must be set.`);
}

function resolveTotpKey(): Buffer {
  const raw = secretEnv('TOTP_ENC_KEY', 'ZGV2LW9ubHktdG90cC1rZXktMzItYnl0ZXMtbG9uZyE');
  const key = Buffer.from(raw, 'base64url');
  if (key.length !== 32) {
    throw new Error('TOTP_ENC_KEY must be 32 bytes in base64url.');
  }
  return key;
}

function resolveFormTokenSecret(): string {
  const secret = secretEnv('FORM_TOKEN_SECRET', 'local-dev-only-form-token-secret-0000');
  if (secret.length < 32) {
    throw new Error('FORM_TOKEN_SECRET must be at least 32 characters.');
  }
  return secret;
}

function list(value: string | undefined): string[] {
  return (value ?? '').split(/[\s,]+/).filter(Boolean);
}

const devPublicOrigins = ['http://localhost:8080'];
const devAdminOrigin = 'http://localhost:8081';

export interface Config {
  port: number;
  nodeEnv: string;
  isLocalDev: boolean;
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
    connectionLimit: number;
  };
  /** Where the no-JS contact form is redirected back to. */
  siteOrigin: string;
  publicOrigins: string[];
  adminOrigin: string;
  totpEncKey: Buffer;
  formTokenSecret: string;
  checkDnsServers: string[];
  session: {
    /** A pending (password OK, TOTP not yet entered) session lives this long. */
    pendingMinutes: number;
    /** Signed-in session ends after this much inactivity … */
    idleHours: number;
    /** … and at the latest this long after sign-in. */
    absoluteDays: number;
  };
  loginRateLimit: {
    windowMs: number;
    max: number;
  };
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv,
  isLocalDev,
  db: {
    host: isLocalDev ? process.env.DB_HOST || '127.0.0.1' : requireEnv('DB_HOST'),
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: isLocalDev ? process.env.DB_USER || 'turve' : requireEnv('DB_USER'),
    password: isLocalDev ? process.env.DB_PASSWORD || 'turve' : requireEnv('DB_PASSWORD'),
    name: isLocalDev ? process.env.DB_NAME || 'turve_dev' : requireEnv('DB_NAME'),
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '5', 10),
  },
  siteOrigin: process.env.SITE_ORIGIN || (isLocalDev ? 'http://localhost:8080' : 'https://www.turve.ee'),
  publicOrigins: list(process.env.PUBLIC_ORIGINS).length
    ? list(process.env.PUBLIC_ORIGINS)
    : isLocalDev
      ? devPublicOrigins
      : ['https://www.turve.ee', 'https://turve.ee'],
  adminOrigin: process.env.ADMIN_ORIGIN || (isLocalDev ? devAdminOrigin : 'https://kapsaaed.turve.ee'),
  totpEncKey: resolveTotpKey(),
  formTokenSecret: resolveFormTokenSecret(),
  checkDnsServers: list(process.env.CHECK_DNS_SERVERS),
  session: {
    pendingMinutes: 5,
    idleHours: 12,
    absoluteDays: 7,
  },
  loginRateLimit: {
    windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || `${15 * 60 * 1000}`, 10),
    max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '5', 10),
  },
};
