// Pure (no DB, no Node APIs): the site build imports the catalog folder too.
import { LAUNCH_OFFER } from './catalog';

export interface OfferStatus {
  spots: number;
  taken: number;
  left: number;
  open: boolean;
  endsOn: string;
}

/** taken = inquiries counted for the offer; todayYmd = today's Tallinn date 'YYYY-MM-DD'. */
export function offerStatus(taken: number, todayYmd: string): OfferStatus {
  const left = Math.max(0, LAUNCH_OFFER.spots - taken);
  return { spots: LAUNCH_OFFER.spots, taken, left, open: left > 0 && todayYmd <= LAUNCH_OFFER.endsOn, endsOn: LAUNCH_OFFER.endsOn };
}
