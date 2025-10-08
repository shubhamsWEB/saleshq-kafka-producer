import { Router, Response } from 'express';
import { RequestWithId } from '../middleware';
import { HealthCheckService } from '../services/health';
import { logger } from '../utils/logger';

export class HealthRoutes {
  private router: Router;
  private healthService: HealthCheckService;

  constructor(healthService: HealthCheckService) {
    this.router = Router();
    this.healthService = healthService;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/health', this.getHealth.bind(this) as any);
    this.router.get('/metrics', this.getMetrics.bind(this) as any);
    this.router.get('/ready', this.getReadiness.bind(this) as any);
    this.router.get('/live', this.getLiveness.bind(this) as any);
  }

  private async getHealth(req: RequestWithId, res: Response): Promise<void> {
    try {
      const healthStatus = this.healthService.getHealthStatus();
      const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

      res.status(statusCode).json(healthStatus);
    } catch (error) {
      logger.error('Health check failed', {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : error,
      });

      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        requestId: req.requestId,
      });
    }
  }

  private async getMetrics(req: RequestWithId, res: Response): Promise<void> {
    try {
      const metrics = this.healthService.getMetrics();
      const healthStatus = this.healthService.getHealthStatus();

      res.json({
        metrics,
        health: healthStatus,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Metrics retrieval failed', {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : error,
      });

      res.status(500).json({
        error: 'Metrics retrieval failed',
        requestId: req.requestId,
      });
    }
  }

  private async getReadiness(req: RequestWithId, res: Response): Promise<void> {
    try {
      const isReady = await this.healthService.performHealthCheck();
      const statusCode = isReady ? 200 : 503;

      res.status(statusCode).json({
        ready: isReady,
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
      });
    } catch (error) {
      logger.error('Readiness check failed', {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : error,
      });

      res.status(503).json({
        ready: false,
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
      });
    }
  }

  private async getLiveness(req: RequestWithId, res: Response): Promise<void> {
    // Liveness check - simple check if the service is running
    res.json({
      alive: true,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    });
  }

  getRouter(): Router {
    return this.router;
  }
}
