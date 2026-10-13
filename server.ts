import express, { NextFunction, Request, Response } from 'express';
import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';

dotenv.config();

const scryptAsync = promisify(scrypt);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const proxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
if (Number.isInteger(proxyHops) && proxyHops > 0) app.set('trust proxy', proxyHops);
const PORT = Number(process.env.PORT || 3000);
const SESSION_DAYS = 14;
const SAVE_KEYS = new Set([
  'upsaLifeStudent', 'upsaLifeFriendships', 'upsaLifeMissionProgress', 'upsaLifeNeeds',
  'upsaLifeWallet', 'upsaLifeRoom', 'upsaLifeChats', 'upsaLifeTime',
  'upsaLifeCourses', 'upsaLifeInventory',
]);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb', strict: true }));

type AccountRequest = Request & { accountId?: string };
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const cookieName = 'upsa_session';
const cookieOptions = (maxAge: number) => [
  `${cookieName}=`,
  'Path=/',
  'HttpOnly',
  'SameSite=Lax',
  process.env.NODE_ENV === 'production' ? 'Secure' : '',
  `Max-Age=${maxAge}`,
].filter(Boolean).join('; ');

async function requireAccount(req: AccountRequest, res: Response, next: NextFunction) {
  try {
    const cookie = req.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`));
    const token = cookie?.slice(cookieName.length + 1);
    if (!token || token.length !== 64) return res.status(401).json({ error: 'Sign in to continue.' });
    const result = await pool.query(
      'SELECT user_id FROM sessions WHERE token_hash = $1 AND expires_at > NOW()',
      [digest(token)]
    );
    if (!result.rowCount) return res.status(401).json({ error: 'Your session has expired. Sign in again.' });
    req.accountId = result.rows[0].user_id;
    return next();
  } catch (error) {
    console.error('Session lookup failed:', error);
    return res.status(503).json({ error: 'Account service is temporarily unavailable.' });
  }
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
function limitLogin(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const key = req.ip || 'unknown';
  let bucket = loginAttempts.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + 15 * 60_000 };
    loginAttempts.set(key, bucket);
  }
  if (bucket.count >= 12) return res.status(429).json({ error: 'Too many sign-in attempts. Try again in 15 minutes.' });
  bucket.count += 1;
  if (loginAttempts.size > 5_000) {
    for (const [ip, entry] of loginAttempts) if (entry.resetAt <= now) loginAttempts.delete(ip);
  }
  return next();
}

async function issueSession(userId: string, res: Response) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await pool.query('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)', [digest(token), userId, expiresAt]);
  res.setHeader('Set-Cookie', cookieOptions(SESSION_DAYS * 24 * 60 * 60).replace(`${cookieName}=;`, `${cookieName}=${token};`));
}

function validateCredentials(body: any): { email: string; password: string } | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  if (typeof body.email !== 'string' || typeof body.password !== 'string') return null;
  const email = body.email.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (body.password.length < 10 || body.password.length > 128) return null;
  return { email, password: body.password };
}

app.post('/api/auth/register', limitLogin, async (req, res) => {
  const credentials = validateCredentials(req.body);
  if (!credentials) return res.status(400).json({ error: 'Enter a valid email and a password with at least 10 characters.' });
  try {
    const passwordHash = scryptSync(credentials.password, randomBytes(16), 64).toString('hex');
    const salt = passwordHash.slice(0, 0); // replaced below by the serialized scrypt format
    const actualSalt = randomBytes(16).toString('hex');
    const derived = (await scryptAsync(credentials.password, actualSalt, 64) as Buffer).toString('hex');
    const encoded = `scrypt:${actualSalt}:${derived}`;
    const created = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [credentials.email, encoded]
    );
    await issueSession(created.rows[0].id, res);
    return res.status(201).json({ user: { id: created.rows[0].id, email: created.rows[0].email } });
  } catch (error: any) {
    if (error?.code === '23505') return res.status(409).json({ error: 'An account already exists for that email.' });
    console.error('Account registration failed:', error);
    return res.status(503).json({ error: 'Could not create your account right now.' });
  }
});

app.post('/api/auth/login', limitLogin, async (req, res) => {
  if (!req.body || typeof req.body.email !== 'string' || typeof req.body.password !== 'string') {
    return res.status(400).json({ error: 'Enter your email and password.' });
  }
  const email = req.body.email.trim().toLowerCase();
  if (email.length > 254 || req.body.password.length > 128) return res.status(400).json({ error: 'Invalid sign-in details.' });
  try {
    const result = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
    if (!result.rowCount) return res.status(401).json({ error: 'Email or password is incorrect.' });
    const [scheme, salt, expectedHex] = result.rows[0].password_hash.split(':');
    const actual = scheme === 'scrypt' && salt && expectedHex ? await scryptAsync(req.body.password, salt, 64) as Buffer : Buffer.alloc(64);
    const expected = Buffer.from(expectedHex || '', 'hex');
    if (scheme !== 'scrypt' || expected.length !== actual.length || !timingSafeEqual(actual, expected)) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    await issueSession(result.rows[0].id, res);
    return res.json({ user: { id: result.rows[0].id, email: result.rows[0].email } });
  } catch (error) {
    console.error('Sign-in failed:', error);
    return res.status(503).json({ error: 'Could not sign in right now.' });
  }
});

app.get('/api/auth/me', requireAccount, async (req: AccountRequest, res) => {
  const result = await pool.query('SELECT id, email FROM users WHERE id = $1', [req.accountId]);
  if (!result.rowCount) return res.status(401).json({ error: 'Account no longer exists.' });
  return res.json({ user: result.rows[0] });
});

app.post('/api/auth/logout', requireAccount, async (req: AccountRequest, res) => {
  const token = req.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  if (token) await pool.query('DELETE FROM sessions WHERE token_hash = $1', [digest(token)]);
  res.setHeader('Set-Cookie', cookieOptions(0));
  return res.status(204).end();
});

app.get('/api/save', requireAccount, async (req: AccountRequest, res) => {
  const result = await pool.query('SELECT save_data, updated_at FROM game_saves WHERE user_id = $1', [req.accountId]);
  return res.json({ save: result.rows[0]?.save_data ?? null, updatedAt: result.rows[0]?.updated_at ?? null });
});

app.put('/api/save', requireAccount, async (req: AccountRequest, res) => {
  const data = req.body?.save;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return res.status(400).json({ error: 'A save object is required.' });
  const entries = Object.entries(data);
  if (entries.some(([key, value]) => !SAVE_KEYS.has(key) || typeof value !== 'string' || value.length > 500_000)) {
    return res.status(400).json({ error: 'The save contains unsupported or oversized game data.' });
  }
  if (Buffer.byteLength(JSON.stringify(data), 'utf8') > 900_000) return res.status(413).json({ error: 'The save is too large.' });
  await pool.query(
    `INSERT INTO game_saves (user_id, save_data, updated_at) VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (user_id) DO UPDATE SET save_data = EXCLUDED.save_data, updated_at = NOW()`,
    [req.accountId, JSON.stringify(data)]
  );
  return res.json({ saved: true });
});

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'ok', database: 'connected' });
  } catch {
    return res.status(503).json({ status: 'unavailable', database: 'disconnected' });
  }
});

async function startServer() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required. Copy .env.example and start the local PostgreSQL service.');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL UNIQUE,
      password_hash text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash char(64) PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions (expires_at);
    CREATE TABLE IF NOT EXISTS game_saves (
      user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      save_data jsonb NOT NULL DEFAULT '{}'::jsonb,
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query('DELETE FROM sessions WHERE expires_at <= NOW()');
  setInterval(() => { void pool.query('DELETE FROM sessions WHERE expires_at <= NOW()').catch((error) => console.error('Session cleanup failed:', error)); }, 60 * 60_000).unref();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist'), { index: false, maxAge: '1h' }));
    app.get('*', (_req, res) => res.sendFile(path.resolve(__dirname, 'dist', 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`UPSA Life listening on port ${PORT}`));
}

startServer().catch((error) => {
  console.error('UPSA Life failed to start:', error);
  process.exit(1);
});
