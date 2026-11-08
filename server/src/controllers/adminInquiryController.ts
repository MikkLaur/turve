import { Request, Response } from 'express';
import { presentCheck } from '../check/present';
import { audit, listAudit } from '../repositories/audit';
import {
  countByStatus,
  deleteInquiry,
  getInquiry,
  INQUIRY_STATUSES,
  InquiryStatus,
  listInquiries,
  setCountsForOffer,
  setInquiryNotes,
  setInquiryStatus,
} from '../repositories/inquiries';
import { findCheckById, listRecentChecks } from '../repositories/securityChecks';
import { clearOfferCache, currentOfferStatus } from './offerController';

const MAX_NOTES = 10_000;

function idParam(req: Request): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function intQuery(value: unknown, fallback: number, max: number): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? Math.min(n, max) : fallback;
}

export async function getOverview(_req: Request, res: Response): Promise<void> {
  const [counts, offer] = await Promise.all([countByStatus(), currentOfferStatus()]);
  res.json({ counts, offer });
}

export async function listInquiriesHandler(req: Request, res: Response): Promise<void> {
  const raw = String(req.query.status ?? 'open');
  const status = raw === 'all' || raw === 'open' || (INQUIRY_STATUSES as readonly string[]).includes(raw) ? (raw as InquiryStatus | 'open' | 'all') : 'open';
  const inquiries = await listInquiries({ status, limit: intQuery(req.query.limit, 50, 200), offset: intQuery(req.query.offset, 0, 100_000) });
  res.json({ inquiries });
}

export async function getInquiryHandler(req: Request, res: Response): Promise<void> {
  const id = idParam(req);
  const inquiry = id ? await getInquiry(id) : null;
  if (!inquiry) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  const check = inquiry.securityCheckId ? await findCheckById(inquiry.securityCheckId) : null;
  res.json({ inquiry, check: check ? presentCheck(check, 'et') : null });
}

export async function setStatusHandler(req: Request, res: Response): Promise<void> {
  const id = idParam(req);
  const status = (req.body as { status?: unknown } | undefined)?.status;
  if (!id || typeof status !== 'string' || !(INQUIRY_STATUSES as readonly string[]).includes(status)) {
    res.status(400).json({ message: 'Invalid status' });
    return;
  }
  if (!(await setInquiryStatus(id, status as InquiryStatus))) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  await audit('inquiry.status', { userId: req.admin?.userId, detail: `#${id} → ${status}`, ip: req.ip });
  // Spam doesn't count in the launch offer, so a status change can change the counter.
  clearOfferCache();
  res.json({ ok: true });
}

/** Counts the inquiry in the launch offer counter, or takes it out (e.g. to count a client who phoned). */
export async function setOfferHandler(req: Request, res: Response): Promise<void> {
  const id = idParam(req);
  const counts = (req.body as { counts?: unknown } | undefined)?.counts;
  if (!id || typeof counts !== 'boolean') {
    res.status(400).json({ message: 'Invalid value' });
    return;
  }
  if (!(await setCountsForOffer(id, counts))) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  await audit('inquiry.offer', { userId: req.admin?.userId, detail: `#${id} → ${counts ? 'arvesse' : 'välja'}`, ip: req.ip });
  clearOfferCache();
  res.json({ ok: true });
}

export async function setNotesHandler(req: Request, res: Response): Promise<void> {
  const id = idParam(req);
  const notes = (req.body as { notes?: unknown } | undefined)?.notes;
  if (!id || (notes !== null && typeof notes !== 'string') || (typeof notes === 'string' && notes.length > MAX_NOTES)) {
    res.status(400).json({ message: 'Invalid notes' });
    return;
  }
  if (!(await setInquiryNotes(id, typeof notes === 'string' && notes.trim() ? notes : null))) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  await audit('inquiry.notes', { userId: req.admin?.userId, detail: `#${id}`, ip: req.ip });
  res.json({ ok: true });
}

/** GDPR erasure: the row is gone; the audit log keeps only the id. */
export async function deleteInquiryHandler(req: Request, res: Response): Promise<void> {
  const id = idParam(req);
  if (!id || !(await deleteInquiry(id))) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  await audit('inquiry.delete', { userId: req.admin?.userId, detail: `#${id}`, ip: req.ip });
  res.status(204).send();
}

export async function listChecksHandler(req: Request, res: Response): Promise<void> {
  res.json({ checks: await listRecentChecks(intQuery(req.query.limit, 50, 200)) });
}

export async function getCheckHandler(req: Request, res: Response): Promise<void> {
  const id = idParam(req);
  const check = id ? await findCheckById(id) : null;
  if (!check) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  res.json({ check: presentCheck(check, 'et') });
}

export async function listAuditHandler(req: Request, res: Response): Promise<void> {
  res.json({ entries: await listAudit(intQuery(req.query.limit, 50, 200)) });
}
