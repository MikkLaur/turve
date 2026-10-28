import cors from 'cors';
import express from 'express';
import { config } from './config/config';
import { requireAdminOrigin } from './middlewares/adminOrigin';
import { errorHandler } from './middlewares/errorHandler';
import { securityHeaders } from './middlewares/securityHeaders';
import adminRoutes from './routes/adminRoutes';
import publicRoutes from './routes/publicRoutes';

const app = express();

app.disable('x-powered-by');
// Apache proxies from loopback; trust its X-Forwarded-For so rate limits see the client IP.
app.set('trust proxy', 'loopback');
app.use(securityHeaders);

// Public endpoints need no cookies. Admin routes answer only the panel's origin, with credentials.
const publicCors = cors({ origin: config.publicOrigins, methods: ['GET', 'POST'] });
const adminCors = cors({ origin: config.adminOrigin, methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true });
app.use((req, res, next) => (req.path.startsWith('/api/admin') ? adminCors : publicCors)(req, res, next));

app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

app.use('/api/admin', requireAdminOrigin, adminRoutes);
app.use('/api', publicRoutes);
app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use(errorHandler);

export default app;
