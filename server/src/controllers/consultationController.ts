import { Request, Response } from 'express';
import { body, matchedData, validationResult } from 'express-validator';
import { CALL_MINUTES, DaySlots, freeSlots, HORIZON_DAYS } from '../consultation/slots';
import { dbNow } from '../db/pool';
import {
  CONSULTATION_TOPICS,
  ConsultationTopic,
  countUpcomingByEmail,
  insertConsultation,
  isDuplicateKey,
  listBlocks,
  listHours,
  NewConsultation,
  takenStarts,
} from '../repositories/consultations';
import { checkFormToken } from '../services/formToken';
import { tallinnYmd } from '../services/tallinnTime';

/** Booking a free 20-minute consultation (/konsultatsioon/). JSON only: the page needs JavaScript to pick a time. */
export const consultationValidation = [
  body('lang').optional().isIn(['et', 'en']),
  body('name').isString().trim().isLength({ min: 2, max: 200 }),
  body('company').optional({ values: 'falsy' }).isString().trim().isLength({ max: 200 }),
  body('email').isString().trim().isLength({ max: 254 }).isEmail(),
  body('phone').isString().trim().isLength({ min: 5, max: 40 }).matches(/^[0-9+()\-.\s]*$/),
  body('topic').optional({ values: 'falsy' }).isIn([...CONSULTATION_TOPICS]),
  body('message').optional({ values: 'falsy' }).isString().trim().isLength({ max: 2000 }),
  body('startsAt').isString().isISO8601(),
  body('consent').custom((value) => value === true || value === 'on' || value === 'true' || value === '1'),
  body('hp').optional(),
  body('token').optional(),
];

/** The single source of bookable times: GET shows these, and POST accepts only one of them. */
async function currentSlots(now: Date): Promise<DaySlots[]> {
  const [hours, blocks, taken] = await Promise.all([
    listHours(),
    listBlocks(tallinnYmd(now)),
    takenStarts(new Date(now.getTime() - 3_600_000), new Date(now.getTime() + (HORIZON_DAYS + 1) * 86_400_000)),
  ]);
  return freeSlots({ hours, blockedDays: new Set(blocks.map((b) => b.day)), takenStarts: taken, now });
}

export async function getSlots(_req: Request, res: Response): Promise<void> {
  res.set('Cache-Control', 'no-store').json({ days: await currentSlots(await dbNow()), callMinutes: CALL_MINUTES });
}

export async function createConsultation(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ code: 'fields', fields: errors.array().map((e) => (e.type === 'field' ? e.path : e.type)) });
    return;
  }
  const data = matchedData(req) as Record<string, unknown>;
  const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : null);
  const start = new Date(String(data.startsAt));
  if (Number.isNaN(start.getTime())) {
    res.status(400).json({ code: 'fields', fields: ['startsAt'] });
    return;
  }
  const startIso = start.toISOString();

  const flags: string[] = [];
  const honeypot = typeof data.hp === 'string' && data.hp.trim() !== '';
  if (honeypot) {
    flags.push('honeypot');
  }
  const verdict = checkFormToken(data.token);
  if (verdict !== 'ok') {
    flags.push(`token-${verdict}`);
  }
  const booking: Omit<NewConsultation, 'status'> = {
    startsAt: start,
    lang: data.lang === 'en' ? 'en' : 'et',
    name: text(data.name)!,
    company: text(data.company),
    email: text(data.email)!,
    phone: text(data.phone)!,
    topic: (text(data.topic) as ConsultationTopic | null) ?? 'other',
    message: text(data.message),
    flags,
  };

  // A honeypot hit is kept for the record but cancelled, so it holds no time; the sender sees the normal answer.
  if (honeypot) {
    await insertConsultation({ ...booking, status: 'cancelled' });
    res.status(201).json({ ok: true, startsAt: startIso });
    return;
  }
  if ((await countUpcomingByEmail(booking.email)) >= 1) {
    res.status(409).json({ code: 'already_booked' });
    return;
  }
  const days = await currentSlots(await dbNow());
  if (!days.some((day) => day.slots.includes(startIso))) {
    res.status(409).json({ code: 'slot_taken' });
    return;
  }
  try {
    await insertConsultation({ ...booking, status: 'booked' });
  } catch (error) {
    // Two people sent the same time at once: the unique key let only one through.
    if (isDuplicateKey(error)) {
      res.status(409).json({ code: 'slot_taken' });
      return;
    }
    throw error;
  }
  res.status(201).json({ ok: true, startsAt: startIso });
}
