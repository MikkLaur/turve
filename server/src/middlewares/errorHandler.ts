import { NextFunction, Request, Response } from 'express';

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
  expose?: boolean;
  type?: string;
}

/** Client errors (bad JSON, body too large) keep their status; anything else is logged and answered generically. */
export function errorHandler(err: HttpError, _req: Request, res: Response, _next: NextFunction): void {
  const status = err.status ?? err.statusCode ?? 500;
  if (status >= 400 && status < 500 && err.expose !== false) {
    res.status(status).json({ message: status === 413 ? 'Request too large' : 'Bad request' });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
}
