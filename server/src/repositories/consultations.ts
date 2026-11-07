// Free 20-minute consultations: bookable hours, blocked days and the bookings themselves. Times are UTC in the DB.
import { getPool, withTransaction } from '../db/pool';
import type { HoursRow } from '../consultation/slots';

export const CONSULTATION_STATUSES = ['booked', 'done', 'no_show', 'cancelled'] as const;
export type ConsultationStatus = (typeof CONSULTATION_STATUSES)[number];

export const CONSULTATION_TOPICS = ['website', 'modernising', 'security', 'other'] as const;
export type ConsultationTopic = (typeof CONSULTATION_TOPICS)[number];

export interface NewConsultation {
  startsAt: Date;
  status: ConsultationStatus;
  lang: 'et' | 'en';
  name: string;
  company: string | null;
  email: string;
  phone: string;
  topic: ConsultationTopic;
  message: string | null;
  flags: string[];
}

export interface ConsultationSummary {
  id: number;
  startsAt: Date;
  status: ConsultationStatus;
  lang: 'et' | 'en';
  name: string;
  company: string | null;
  email: string;
  phone: string;
  topic: ConsultationTopic;
  flags: string | null;
}

export interface Consultation extends ConsultationSummary {
  message: string | null;
  adminNotes: string | null;
  consentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockedDay {
  /** Tallinn date 'YYYY-MM-DD' */
  day: string;
  note: string | null;
}

const SUMMARY_COLUMNS = 'id, startsAt, status, lang, name, company, email, phone, topic, flags';
/** A booking still to come (with a little grace, so a call that just started stays on the list). */
const UPCOMING = "status = 'booked' AND startsAt >= UTC_TIMESTAMP() - INTERVAL 2 HOUR";

/* ---------- bookable hours and blocked days ---------- */

export async function listHours(): Promise<HoursRow[]> {
  const rows: HoursRow[] = await getPool().query('SELECT weekday, startTime, endTime FROM ConsultationHours ORDER BY weekday, startTime');
  return rows.map((row) => ({ weekday: Number(row.weekday), startTime: row.startTime, endTime: row.endTime }));
}

/** Replaces all weekly windows at once (the kapsaaed "Ajad" form saves the whole list). */
export async function replaceHours(rows: readonly HoursRow[]): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.query('DELETE FROM ConsultationHours');
    for (const row of rows) {
      await conn.query('INSERT INTO ConsultationHours (weekday, startTime, endTime) VALUES (?, ?, ?)', [row.weekday, row.startTime, row.endTime]);
    }
  });
}

/** Blocked days from fromYmd on. */
export async function listBlocks(fromYmd: string): Promise<BlockedDay[]> {
  return getPool().query("SELECT DATE_FORMAT(day, '%Y-%m-%d') AS day, note FROM ConsultationBlocks WHERE day >= ? ORDER BY day", [fromYmd]);
}

export async function addBlock(day: string, note: string | null): Promise<void> {
  await getPool().query('INSERT INTO ConsultationBlocks (day, note) VALUES (?, ?) ON DUPLICATE KEY UPDATE note = VALUES(note)', [day, note]);
}

export async function deleteBlock(day: string): Promise<boolean> {
  const result = await getPool().query('DELETE FROM ConsultationBlocks WHERE day = ?', [day]);
  return Number(result.affectedRows) === 1;
}

/* ---------- bookings ---------- */

/** Start times of every booking that holds its time (anything not cancelled) in a range. */
export async function takenStarts(fromUtc: Date, toUtc: Date): Promise<Date[]> {
  const rows: { startsAt: Date }[] = await getPool().query(
    "SELECT startsAt FROM Consultations WHERE status <> 'cancelled' AND startsAt BETWEEN ? AND ?",
    [fromUtc, toUtc],
  );
  return rows.map((row) => row.startsAt);
}

/** Booked consultations still ahead for an e-mail address (the collation compares it case-insensitively). */
export async function countUpcomingByEmail(email: string): Promise<number> {
  const rows: { n: number }[] = await getPool().query(
    "SELECT COUNT(*) AS n FROM Consultations WHERE email = ? AND status = 'booked' AND startsAt > UTC_TIMESTAMP()",
    [email],
  );
  return Number(rows[0]!.n);
}

/** Throws the driver's duplicate-key error (errno 1062) if another active booking already has this start. */
export async function insertConsultation(input: NewConsultation): Promise<number> {
  const result = await getPool().query(
    `INSERT INTO Consultations (startsAt, status, lang, name, company, email, phone, topic, message, flags, consentAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
    [
      input.startsAt,
      input.status,
      input.lang,
      input.name,
      input.company,
      input.email,
      input.phone,
      input.topic,
      input.message,
      input.flags.length ? input.flags.join(',') : null,
    ],
  );
  return Number(result.insertId);
}

export function isDuplicateKey(error: unknown): boolean {
  return (error as { errno?: number } | null)?.errno === 1062;
}

/** upcoming: booked and still ahead, soonest first; past: everything else, newest first. */
export async function listConsultations(scope: 'upcoming' | 'past'): Promise<ConsultationSummary[]> {
  return scope === 'upcoming'
    ? getPool().query(`SELECT ${SUMMARY_COLUMNS} FROM Consultations WHERE ${UPCOMING} ORDER BY startsAt ASC LIMIT 200`)
    : getPool().query(`SELECT ${SUMMARY_COLUMNS} FROM Consultations WHERE NOT (${UPCOMING}) ORDER BY startsAt DESC LIMIT 200`);
}

export async function countUpcoming(): Promise<number> {
  const rows: { n: number }[] = await getPool().query(`SELECT COUNT(*) AS n FROM Consultations WHERE ${UPCOMING}`);
  return Number(rows[0]!.n);
}

export async function getConsultation(id: number): Promise<Consultation | null> {
  const rows: Consultation[] = await getPool().query(
    `SELECT ${SUMMARY_COLUMNS}, message, adminNotes, consentAt, createdAt, updatedAt FROM Consultations WHERE id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

export async function setConsultationStatus(id: number, status: ConsultationStatus): Promise<boolean> {
  const result = await getPool().query('UPDATE Consultations SET status = ? WHERE id = ?', [status, id]);
  return Number(result.affectedRows) === 1;
}

export async function setConsultationNotes(id: number, notes: string | null): Promise<boolean> {
  const result = await getPool().query('UPDATE Consultations SET adminNotes = ? WHERE id = ?', [notes, id]);
  return Number(result.affectedRows) === 1;
}

export async function deleteConsultation(id: number): Promise<boolean> {
  const result = await getPool().query('DELETE FROM Consultations WHERE id = ?', [id]);
  return Number(result.affectedRows) === 1;
}
