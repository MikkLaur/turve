import { Request, Response } from 'express';
import { OfferStatus, offerStatus } from '../catalog/launchOffer';
import { offerTaken } from '../repositories/inquiries';
import { tallinnYmd } from '../services/tallinnTime';

// The counter is public and cheap to ask for, so it is cached briefly. Date.now() only measures this process's own
// cache age here; the offer's date logic uses the DB clock (offerTaken() reads it).
const CACHE_MS = 30_000;
let cache: { at: number; body: OfferStatus } | null = null;

export async function currentOfferStatus(): Promise<OfferStatus> {
  const { taken, now } = await offerTaken();
  return offerStatus(taken, tallinnYmd(now));
}

export async function getLaunchOffer(_req: Request, res: Response): Promise<void> {
  if (!cache || Date.now() - cache.at > CACHE_MS) {
    cache = { at: Date.now(), body: await currentOfferStatus() };
  }
  res.set('Cache-Control', 'public, max-age=30').json(cache.body);
}

/** Call after anything that changes the count. */
export function clearOfferCache(): void {
  cache = null;
}
