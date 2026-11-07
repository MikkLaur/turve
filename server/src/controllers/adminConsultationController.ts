import { Request, Response } from 'express';
import type { HoursRow } from '../consultation/slots';
import { dbNow } from '../db/pool';
import { audit } from '../repositories/audit';
import {
  addBlock,
  CONSULTATION_STATUSES,
  ConsultationStatus,
  deleteBlock,
  deleteConsultation,
  getConsultation,
  isDuplicateKey,
  listBlocks,
  listConsultations,
  listHours,
  replaceHours,
  setConsultationNotes,
  setConsultationStatus,
} from '../repositories/consultations';
import { isValidYmd, tallinnYmd } from '../services/tallinnTime';

const MAX_NOTES = 10_000;
const MAX_HOURS_ROWS = 30;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function idParam(req: Request): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function listConsultationsHandler(req: Request, res: Response): Promise<void> {
  const scope = req.query.scope === 'past' ? 'past' : 'upcoming';
  res.json({ consultations: await listConsultations(scope) });
}

export async function getConsultationHandler(req: Request, res: Response): Promise<void> {
  const id = idParam(req);
  const consultation = id ? await getConsultation(id) : null;
  if (!consultation) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  res.json({ consultation });
}

export async function setConsultationStatusHandler(req: Request, res: Response): Promise<void> {
  const id = idParam(req);
  const status = (req.body as { status?: unknown } | undefined)?.status;
  if (!id || typeof status !== 'string' || !(CONSULTATION_STATUSES as readonly string[]).includes(status)) {
    res.status(400).json({ message: 'Invalid status' });
    return;
  }
  try {
    if (!(await setConsultationStatus(id, status as ConsultationStatus))) {
      res.status(404).json({ message: 'Not found' });
      return;
    }
  } catch (error) {
    // Restoring a cancelled booking whose time someone else has booked since.
    if (isDuplicateKey(error)) {
      res.status(409).json({ message: 'See aeg on vahepeal teisele broneeritud.' });
      return;
    }
    throw error;
  }
  await audit('consultation.status', { userId: req.admin?.userId, detail: `#${id} → ${status}`, ip: req.ip });
  res.json({ ok: true });
}

export async function setConsultationNotesHandler(req: Request, res: Response): Promise<void> {
  const id = idParam(req);
  const notes = (req.body as { notes?: unknown } | undefined)?.notes;
  if (!id || (notes !== null && typeof notes !== 'string') || (typeof notes === 'string' && notes.length > MAX_NOTES)) {
    res.status(400).json({ message: 'Invalid notes' });
    return;
  }
  if (!(await setConsultationNotes(id, typeof notes === 'string' && notes.trim() ? notes : null))) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  await audit('consultation.notes', { userId: req.admin?.userId, detail: `#${id}`, ip: req.ip });
  res.json({ ok: true });
}

/** GDPR erasure: the row is gone; the audit log keeps only the id. */
export async function deleteConsultationHandler(req: Request, res: Response): Promise<void> {
  const id = idParam(req);
  if (!id || !(await deleteConsultation(id))) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  await audit('consultation.delete', { userId: req.admin?.userId, detail: `#${id}`, ip: req.ip });
  res.status(204).send();
}

export async function getHoursHandler(_req: Request, res: Response): Promise<void> {
  const [hours, blocks] = await Promise.all([listHours(), listBlocks(tallinnYmd(await dbNow()))]);
  res.json({ hours, blocks });
}

/** Saves the whole list of weekly windows (ISO weekday 1–7, 'HH:MM'–'HH:MM' Tallinn time). */
export async function putHoursHandler(req: Request, res: Response): Promise<void> {
  const raw = (req.body as { hours?: unknown } | undefined)?.hours;
  if (!Array.isArray(raw) || raw.length > MAX_HOURS_ROWS) {
    res.status(400).json({ message: 'Vigased ajad.' });
    return;
  }
  const rows: HoursRow[] = [];
  for (const item of raw) {
    const { weekday, startTime, endTime } = (item ?? {}) as Record<string, unknown>;
    if (
      typeof weekday !== 'number' ||
      !Number.isInteger(weekday) ||
      weekday < 1 ||
      weekday > 7 ||
      typeof startTime !== 'string' ||
      typeof endTime !== 'string' ||
      !TIME.test(startTime) ||
      !TIME.test(endTime) ||
      startTime >= endTime
    ) {
      res.status(400).json({ message: 'Igal real peab olema nädalapäev ja algusaeg enne lõppaega.' });
      return;
    }
    rows.push({ weekday, startTime, endTime });
  }
  await replaceHours(rows);
  await audit('consultation.hours', { userId: req.admin?.userId, detail: `${rows.length} rida`, ip: req.ip });
  res.json({ ok: true });
}

export async function addBlockHandler(req: Request, res: Response): Promise<void> {
  const { day, note } = (req.body ?? {}) as { day?: unknown; note?: unknown };
  if (typeof day !== 'string' || !isValidYmd(day) || (note !== undefined && note !== null && (typeof note !== 'string' || note.length > 200))) {
    res.status(400).json({ message: 'Vigane kuupäev või märkus.' });
    return;
  }
  await addBlock(day, typeof note === 'string' && note.trim() ? note.trim() : null);
  await audit('consultation.block', { userId: req.admin?.userId, detail: `${day} lisatud`, ip: req.ip });
  res.json({ ok: true });
}

export async function deleteBlockHandler(req: Request, res: Response): Promise<void> {
  const day = String(req.params.day ?? '');
  if (!isValidYmd(day)) {
    res.status(400).json({ message: 'Vigane kuupäev.' });
    return;
  }
  if (!(await deleteBlock(day))) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  await audit('consultation.block', { userId: req.admin?.userId, detail: `${day} eemaldatud`, ip: req.ip });
  res.status(204).send();
}
