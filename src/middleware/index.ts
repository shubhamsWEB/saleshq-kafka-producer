import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export interface RequestWithId extends Request {
  requestId: string;
  correlationId: string;
  startTime: number;
}

export const requestIdMiddleware = (req: RequestWithId, res: Response, next: NextFunction): void => {
  req.requestId = req.headers['x-request-id'] as string || uuidv4();
  req.correlationId = req.headers['x-correlation-id'] as string || uuidv4();
  req.startTime = Date.now();

  res.setHeader('X-Request-ID', req.requestId);
  res.setHeader('X-Correlation-ID', req.correlationId);

  next();
};

export const loggingMiddleware = (req: RequestWithId, res: Response, next: NextFunction): void => {
  const requestLogger = logger.child({
    requestId: req.requestId,
    correlationId: req.correlationId,
  });

  requestLogger.info('Request started', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    requestLogger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
};

export const errorHandlingMiddleware = (
  error: Error,
  req: RequestWithId,
  res: Response,
  _next: NextFunction
): void => {
  const requestLogger = logger.child({
    requestId: req.requestId,
    correlationId: req.correlationId,
  });

  requestLogger.error('Request error', {
    method: req.method,
    url: req.url,
    error: error.message,
    stack: error.stack,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    requestId: req.requestId,
    correlationId: req.correlationId,
  });
};

export const notFoundMiddleware = (req: RequestWithId, res: Response): void => {
  const requestLogger = logger.child({
    requestId: req.requestId,
    correlationId: req.correlationId,
  });

  requestLogger.warn('Route not found', {
    method: req.method,
    url: req.url,
  });

  res.status(404).json({
    error: 'Not Found',
    requestId: req.requestId,
    correlationId: req.correlationId,
  });
};
