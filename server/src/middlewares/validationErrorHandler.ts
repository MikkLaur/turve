import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

export function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: 'Validation failed', fields: errors.array().map((e) => (e.type === 'field' ? e.path : e.type)) });
    return;
  }
  next();
}
