import { NextFunction, Request, Response } from 'express';
import { config } from '../config/config';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF guard. www.turve.ee is the same site as kapsaaed.turve.ee, so SameSite alone doesn't stop the
 * public pages from sending the admin cookie; state changes must come from the panel's origin as JSON.
 */
export function requireAdminOrigin(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }
  if (req.headers.origin !== config.adminOrigin) {
    res.status(403).json({ message: 'Forbidden origin' });
    return;
  }
  const hasBody = Number(req.headers['content-length'] ?? 0) > 0;
  if (hasBody && !req.is('application/json')) {
    res.status(415).json({ message: 'Expected application/json' });
    return;
  }
  next();
}
