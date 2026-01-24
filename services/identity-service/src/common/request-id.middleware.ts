import type { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request type
export interface RequestWithId extends Request {
  requestId?: string;
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const incoming = req.header('x-request-id');
  const requestId = incoming && incoming.trim().length > 0 ? incoming.trim() : uuidv4();

  (req as any).requestId = requestId;
  res.setHeader('x-request-id', requestId);

  next();
}
