import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { appConfig } from './config';
import { logger } from './utils/logger';
import { KafkaService } from './services/kafka';
import { HealthCheckService } from './services/health';
import { HealthRoutes } from './routes/health';
import { CustomPixelRoutes } from './routes/custom-pixel';
import {
  requestIdMiddleware,
  loggingMiddleware,
  errorHandlingMiddleware,
  notFoundMiddleware,
} from './middleware';

export class App {
  private app: express.Application;
  private kafkaService: KafkaService;
  private healthService: HealthCheckService;
  private customPixelRoutes: CustomPixelRoutes;
  private server: any;

  constructor() {
    this.app = express();
    this.kafkaService = new KafkaService();
    this.healthService = new HealthCheckService(this.kafkaService);
    this.customPixelRoutes = new CustomPixelRoutes(this.kafkaService);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());

    // Custom middleware
    this.app.use(requestIdMiddleware as any);
    this.app.use(loggingMiddleware as any);

    // Body parsing middleware
    this.app.use(express.text({ type: '*/*' }));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private setupRoutes(): void {
    // Health routes
    const healthRoutes = new HealthRoutes(this.healthService);
    this.app.use('/health', healthRoutes.getRouter());

    // Custom pixel routes
    this.app.use('/webhooks', this.customPixelRoutes.getRouter());

    // Root route
    this.app.get('/', (_req, res) => {
      res.json({
        service: 'Custom Pixel Analytics Kafka Producer',
        version: process.env['npm_package_version'] || '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(notFoundMiddleware as any);
    this.app.use(errorHandlingMiddleware as any);
  }

  async start(): Promise<void> {
    try {
      // Connect to Kafka
      await this.kafkaService.connect();
      logger.info('Kafka service connected');

      // Start server
      this.server = this.app.listen(appConfig.server.port, () => {
        logger.info('Server started', {
          port: appConfig.server.port,
          environment: appConfig.server.nodeEnv,
        });
      });

      // Setup graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('Failed to start application', {
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, starting graceful shutdown`);

      // Stop accepting new requests
      if (this.server) {
        this.server.close(() => {
          logger.info('HTTP server closed');
        });
      }

      // Close Kafka connections
      try {
        await this.kafkaService.disconnect();
        logger.info('Kafka service disconnected');
      } catch (error) {
        logger.error('Error disconnecting Kafka service', {
          error: error instanceof Error ? error.message : error,
        });
      }

      // Exit process
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  getApp(): express.Application {
    return this.app;
  }
}

export default App;
