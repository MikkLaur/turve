import { NextFunction, Request, Response } from 'express';
import { config } from '../config/config';
import { deleteSession, getSession, touchSession } from '../repositories/sessions';
import type { UserRole } from '../repositories/users';
import { clearSessionCookie, readCookie, SESSION_COOKIE, sessionIdFromToken } from '../services/session';

export interface AdminContext {
  sessionId: string;
  userId: number;
  username: string;
  displayName: string | null;
  role: UserRole;
}

declare module 'express-serve-static-core' {
  interface Request {
    admin?: AdminContext;
  }
}

const TOUCH_AFTER_SECONDS = 5 * 60;

/** Requires a signed-in (password + TOTP) session that is neither expired nor idle too long. */
export async function requireSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = readCookie(req.headers.cookie, SESSION_COOKIE);
  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const id = sessionIdFromToken(token);
  const session = await getSession(id);
  if (!session || session.mfaVerifiedAt === null) {
    // Unknown, or still waiting for the TOTP code: no access, but a pending login is left alone to finish.
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  if (session.expired || session.disabledAt !== null || session.idleSeconds >= config.session.idleHours * 3600) {
    await deleteSession(id);
    clearSessionCookie(res);
    res.status(401).json({ message: 'Session expired' });
    return;
  }
  if (session.idleSeconds > TOUCH_AFTER_SECONDS) {
    await touchSession(id);
  }
  req.admin = { sessionId: id, userId: session.userId, username: session.username, displayName: session.displayName, role: session.role };
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
