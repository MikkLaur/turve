import { getPool, parseJson } from '../db/pool';
import type { PricedSelection } from '../catalog/pricing';

export const INQUIRY_STATUSES = ['new', 'in_progress', 'won', 'lost', 'spam'] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export interface NewInquiry {
  lang: 'et' | 'en';
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  message: string | null;
  selection: PricedSelection | null;
  securityCheckId: number | null;
  status: InquiryStatus;
  flags: string[];
  /** Takes a spot in the launch offer. */
  countsForOffer: boolean;
}

export interface InquirySummary {
  id: number;
  createdAt: Date;
  lang: 'et' | 'en';
  name: string;
  company: string | null;
  email: string;
  status: InquiryStatus;
  onceCents: number;
  monthlyCents: number;
  flags: string | null;
  securityCheckId: number | null;
  /** 1 = counted in the launch offer counter (TINYINT). */
  countsForOffer: number;
}

export interface Inquiry extends InquirySummary {
  phone: string | null;
  website: string | null;
  message: string | null;
  selection: PricedSelection | null;
  catalogVersion: string | null;
  onceMinutes: number;
  monthlyMinutes: number;
  adminNotes: string | null;
  consentAt: Date;
  updatedAt: Date;
}

export async function insertInquiry(input: NewInquiry): Promise<number> {
  const s = input.selection;
  const result = await getPool().query(
    // onceMinutes/monthlyMinutes are left at their default 0: packages have fixed prices since catalog 2026-11-08.1.
    `INSERT INTO Inquiries (lang, name, company, email, phone, website, message, selectionJson, catalogVersion,
        onceCents, monthlyCents, securityCheckId, status, flags, countsForOffer, consentAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
    [
      input.lang,
      input.name,
      input.company,
      input.email,
      input.phone,
      input.website,
      input.message,
      s && s.lines.length ? JSON.stringify(s) : null,
      s && s.lines.length ? s.catalogVersion : null,
      s?.onceCents ?? 0,
      s?.monthlyCents ?? 0,
      input.securityCheckId,
      input.status,
      input.flags.length ? input.flags.join(',') : null,
      input.countsForOffer ? 1 : 0,
    ],
  );
  return Number(result.insertId);
}

export async function listInquiries(filter: { status: InquiryStatus | 'open' | 'all'; limit: number; offset: number }): Promise<InquirySummary[]> {
  const where =
    filter.status === 'all' ? '' : filter.status === 'open' ? "WHERE status IN ('new', 'in_progress')" : 'WHERE status = ?';
  const params: unknown[] = filter.status === 'all' || filter.status === 'open' ? [] : [filter.status];
  return getPool().query(
    `SELECT id, createdAt, lang, name, company, email, status, onceCents, monthlyCents, flags, securityCheckId, countsForOffer
       FROM Inquiries ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, filter.limit, filter.offset],
  );
}

export async function countByStatus(): Promise<Record<InquiryStatus, number>> {
  const rows: { status: InquiryStatus; n: number }[] = await getPool().query('SELECT status, COUNT(*) AS n FROM Inquiries GROUP BY status');
  const counts = Object.fromEntries(INQUIRY_STATUSES.map((s) => [s, 0])) as Record<InquiryStatus, number>;
  for (const row of rows) {
    counts[row.status] = Number(row.n);
  }
  return counts;
}

export async function getInquiry(id: number): Promise<Inquiry | null> {
  const rows: (Omit<Inquiry, 'selection'> & { selectionJson: unknown })[] = await getPool().query(
    `SELECT id, createdAt, updatedAt, lang, name, company, email, phone, website, message, selectionJson, catalogVersion,
            onceMinutes, onceCents, monthlyMinutes, monthlyCents, securityCheckId, status, flags, countsForOffer, adminNotes, consentAt
       FROM Inquiries WHERE id = ?`,
    [id],
  );
  const row = rows[0];
  if (!row) {
    return null;
  }
  const { selectionJson, ...rest } = row;
  return { ...rest, selection: parseJson<PricedSelection>(selectionJson) };
}

export async function setInquiryStatus(id: number, status: InquiryStatus): Promise<boolean> {
  const result = await getPool().query('UPDATE Inquiries SET status = ? WHERE id = ?', [status, id]);
  return Number(result.affectedRows) === 1;
}

export async function setInquiryNotes(id: number, notes: string | null): Promise<boolean> {
  const result = await getPool().query('UPDATE Inquiries SET adminNotes = ? WHERE id = ?', [notes, id]);
  return Number(result.affectedRows) === 1;
}

export async function deleteInquiry(id: number): Promise<boolean> {
  const result = await getPool().query('DELETE FROM Inquiries WHERE id = ?', [id]);
  return Number(result.affectedRows) === 1;
}

/** Spots taken in the launch offer, with the DB's clock read in the same query. Spam never counts. */
export async function offerTaken(): Promise<{ taken: number; now: Date }> {
  const rows: { n: number; now: Date }[] = await getPool().query(
    "SELECT COUNT(*) AS n, UTC_TIMESTAMP() AS now FROM Inquiries WHERE countsForOffer = 1 AND status <> 'spam'",
  );
  return { taken: Number(rows[0]!.n), now: rows[0]!.now };
}

export async function setCountsForOffer(id: number, counts: boolean): Promise<boolean> {
  const result = await getPool().query('UPDATE Inquiries SET countsForOffer = ? WHERE id = ?', [counts ? 1 : 0, id]);
  return Number(result.affectedRows) === 1;
}
