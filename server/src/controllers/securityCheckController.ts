import { Request, Response } from 'express';
import type { Lang } from '../catalog/catalog';
import { normalizeHostname } from '../check/hostname';
import { presentCheck } from '../check/present';
import { runSecurityCheck } from '../check/runCheck';
import { CheckInputError } from '../check/types';
import { findRecentCheck, insertCheck } from '../repositories/securityChecks';

const CACHE_MINUTES = 60;

export async function securityCheck(req: Request, res: Response): Promise<void> {
  const input = (req.body ?? {}) as { domain?: unknown; lang?: unknown };
  const lang: Lang = input.lang === 'en' ? 'en' : 'et';
  try {
    const hostname = normalizeHostname(input.domain);
    // The same domain within the hour gets the stored result: no new requests to that site.
    const cached =
      (await findRecentCheck(hostname, CACHE_MINUTES)) ??
      (hostname.startsWith('www.') ? null : await findRecentCheck(`www.${hostname}`, CACHE_MINUTES));
    const stored = cached ?? (await insertCheck(await runSecurityCheck(hostname)));
    res.json(presentCheck(stored, lang));
  } catch (error) {
    if (error instanceof CheckInputError) {
      res.status(error.code === 'busy' ? 503 : 400).json({ code: error.code });
      return;
    }
    throw error;
  }
}
