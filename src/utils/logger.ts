import winston from 'winston';
import { appConfig } from '../config';

const { logLevel, logFormat } = appConfig.server;

const logFormatConfig = logFormat === 'json' 
  ? winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    )
  : winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
      })
    );

export const logger = winston.createLogger({
  level: logLevel,
  format: logFormatConfig,
  defaultMeta: { service: 'shopify-analytics-producer' },
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  exitOnError: false,
});

// Add request ID to logs
export const addRequestId = (requestId: string) => {
  return logger.child({ requestId });
};

// Add correlation ID to logs
export const addCorrelationId = (correlationId: string) => {
  return logger.child({ correlationId });
};

export default logger;
