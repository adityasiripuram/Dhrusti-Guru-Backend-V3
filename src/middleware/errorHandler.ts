import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

interface ApiError extends Error {
  status?: number;
}

export function errorHandler(err: ApiError, _req: Request, res: Response, _next: NextFunction) {
  logger.error({ err }, 'Unhandled error');

  const status = err.status ?? 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    status
  });
}
