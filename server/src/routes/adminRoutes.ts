import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, me, verifyLoginTotp } from '../controllers/adminAuthController';
import {
  deleteInquiryHandler,
  getCheckHandler,
  getInquiryHandler,
  getOverview,
  listAuditHandler,
  listChecksHandler,
  listInquiriesHandler,
  setNotesHandler,
  setStatusHandler,
} from '../controllers/adminInquiryController';
import { config } from '../config/config';
import { requireRole, requireSession } from '../middlewares/requireSession';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: config.loginRateLimit.windowMs,
  limit: config.loginRateLimit.max,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Liiga palju sisselogimiskatseid. Proovi 15 minuti pärast uuesti.' },
});

router.post('/login', loginLimiter, login);
router.post('/login/totp', loginLimiter, verifyLoginTotp);
router.post('/logout', logout);

// Everything below requires a full (password + TOTP) admin session.
router.use(requireSession, requireRole('admin'));

router.get('/me', me);
router.get('/overview', getOverview);
router.get('/inquiries', listInquiriesHandler);
router.get('/inquiries/:id', getInquiryHandler);
router.post('/inquiries/:id/status', setStatusHandler);
router.post('/inquiries/:id/notes', setNotesHandler);
router.delete('/inquiries/:id', deleteInquiryHandler);
router.get('/security-checks', listChecksHandler);
router.get('/security-checks/:id', getCheckHandler);
router.get('/audit', listAuditHandler);

export default router;
