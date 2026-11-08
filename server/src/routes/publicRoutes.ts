import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createInquiry, getFormToken, inquiryValidation } from '../controllers/inquiryController';
import { getLaunchOffer } from '../controllers/offerController';
import { securityCheck } from '../controllers/securityCheckController';
import { getPool } from '../db/pool';

const router = Router();

const limiter = (windowMinutes: number, max: number, message: string) =>
  rateLimit({ windowMs: windowMinutes * 60_000, limit: max, standardHeaders: 'draft-8', legacyHeaders: false, message: { code: 'rate_limited', message } });

router.get('/health', async (_req, res) => {
  await getPool().query('SELECT 1');
  res.json({ ok: true });
});

router.get('/form-token', limiter(15, 60, 'Too many requests'), getFormToken);
router.get('/launch-offer', limiter(15, 120, 'Too many requests'), getLaunchOffer);
router.post('/inquiries', limiter(60, 5, 'Too many inquiries, try again later'), inquiryValidation, createInquiry);
router.post('/security-check', limiter(60, 10, 'Too many checks, try again later'), securityCheck);

export default router;
