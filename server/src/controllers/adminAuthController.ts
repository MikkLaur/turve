import { Request, Response } from 'express';
import { config } from '../config/config';
import { audit } from '../repositories/audit';
import { deleteExpiredSessions, deleteSession, getSession, insertSession, promoteSession, recordFailedMfa } from '../repositories/sessions';
import { consumeTotpStep, getUserById, getUserByUsername } from '../repositories/users';
import { verifyAgainstDummy, verifyPassword } from '../services/password';
import { open } from '../services/secretBox';
import { clearSessionCookie, newSessionToken, readCookie, SESSION_COOKIE, sessionIdFromToken, setSessionCookie } from '../services/session';
import { verifyTotp } from '../services/totp';

const MAX_MFA_ATTEMPTS = 5;
const WRONG_LOGIN = { message: 'Vale kasutajanimi või parool.' };

function body(req: Request): Record<string, unknown> {
  return (req.body ?? {}) as Record<string, unknown>;
}

/** Step 1: username + password. Success only opens a 5-minute pending session that waits for the TOTP code. */
export async function login(req: Request, res: Response): Promise<void> {
  const username = String(body(req).username ?? '').trim();
  const password = String(body(req).password ?? '');
  const user = username ? await getUserByUsername(username) : null;
  const ok = user && !user.disabledAt ? await verifyPassword(password, user.passwordHash) : await verifyAgainstDummy(password);

  if (!user || !ok) {
    await audit('login.password_failed', { userId: user?.id, detail: `username=${username.slice(0, 64)}`, ip: req.ip });
    res.status(401).json(WRONG_LOGIN);
    return;
  }
  if (!user.totpSecretEnc) {
    res.status(403).json({ message: 'Kaheastmeline kinnitus on seadistamata. Käivita serveris: npm run reset-totp' });
    return;
  }

  await deleteExpiredSessions();
  const { token, id } = newSessionToken();
  const pendingSeconds = config.session.pendingMinutes * 60;
  await insertSession({ id, userId: user.id, ttlSeconds: pendingSeconds, userAgent: req.get('user-agent')?.slice(0, 255) ?? null });
  setSessionCookie(res, token, pendingSeconds * 1000);
  await audit('login.password_ok', { userId: user.id, ip: req.ip });
  res.status(200).json({ step: 'totp' });
}

/** Step 2: the 6-digit code. On success the pending session is replaced by a new full one (new token). */
export async function verifyLoginTotp(req: Request, res: Response): Promise<void> {
  const token = readCookie(req.headers.cookie, SESSION_COOKIE);
  const session = token ? await getSession(sessionIdFromToken(token)) : null;
  if (!session || session.mfaVerifiedAt !== null || session.expired || session.disabledAt) {
    clearSessionCookie(res);
    res.status(401).json({ message: 'Sisselogimine aegus. Alusta uuesti.' });
    return;
  }

  const user = await getUserById(session.userId);
  const secret = user?.totpSecretEnc ? open(user.totpSecretEnc) : null;
  const step = secret ? verifyTotp(secret, String(body(req).code ?? ''), user!.totpLastStep) : null;
  const consumed = step !== null && (await consumeTotpStep(session.userId, step));

  if (!consumed) {
    const attempts = await recordFailedMfa(session.id);
    if (attempts >= MAX_MFA_ATTEMPTS) {
      await deleteSession(session.id);
      clearSessionCookie(res);
      await audit('login.totp_locked', { userId: session.userId, ip: req.ip });
      res.status(401).json({ message: 'Liiga palju valesid koode. Alusta uuesti.' });
      return;
    }
    await audit('login.totp_failed', { userId: session.userId, ip: req.ip });
    res.status(401).json({ message: 'Vale kood.' });
    return;
  }

  const fresh = newSessionToken();
  const lifetimeSeconds = config.session.absoluteDays * 86_400;
  if (!(await promoteSession(session.id, fresh.id, lifetimeSeconds))) {
    clearSessionCookie(res);
    res.status(401).json({ message: 'Sisselogimine aegus. Alusta uuesti.' });
    return;
  }
  setSessionCookie(res, fresh.token, lifetimeSeconds * 1000);
  await audit('login.totp_ok', { userId: session.userId, ip: req.ip });
  res.status(200).json({ user: { username: session.username, displayName: session.displayName } });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const token = readCookie(req.headers.cookie, SESSION_COOKIE);
  if (token) {
    const id = sessionIdFromToken(token);
    const session = await getSession(id);
    await deleteSession(id);
    if (session) {
      await audit('logout', { userId: session.userId, ip: req.ip });
    }
  }
  clearSessionCookie(res);
  res.status(204).send();
}

export function me(req: Request, res: Response): void {
  res.status(200).json({ user: { username: req.admin?.username, displayName: req.admin?.displayName } });
}
