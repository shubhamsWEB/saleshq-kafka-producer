import App from './app';
import { logger } from './utils/logger';
import { appConfig } from './config';

async function main(): Promise<void> {
  try {
    logger.info('Starting Shopify Analytics Kafka Producer', {
      version: process.env['npm_package_version'] || '1.0.0',
      environment: appConfig.server.nodeEnv,
      port: appConfig.server.port,
    });

    const app = new App();
    await app.start();

    logger.info('Application started successfully');

  } catch (error) {
    logger.error('Failed to start application', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    promise: promise.toString(),
  });
  process.exit(1);
});

// Start the application
main().catch((error) => {
  logger.error('Application startup failed', {
    error: error instanceof Error ? error.message : error,
  });
  process.exit(1);
});
