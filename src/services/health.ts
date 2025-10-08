import { HealthStatus } from '../types';
import { logger } from '../utils/logger';

export class HealthCheckService {
  private startTime: number;
  private kafkaService: any;
  private metrics = {
    totalEvents: 0,
    successfulEvents: 0,
    failedEvents: 0,
    lastEventTime: undefined as string | undefined,
  };

  constructor(kafkaService: any) {
    this.startTime = Date.now();
    this.kafkaService = kafkaService;
  }

  getHealthStatus(): HealthStatus {
    const uptime = Date.now() - this.startTime;
    const kafkaStatus = this.kafkaService?.getHealthStatus() || 'unknown';
    const kafkaMetrics = this.kafkaService?.getMetrics() || {};

    // Update metrics from Kafka service
    this.metrics = {
      totalEvents: kafkaMetrics.totalEvents || 0,
      successfulEvents: kafkaMetrics.successfulEvents || 0,
      failedEvents: kafkaMetrics.failedEvents || 0,
      lastEventTime: kafkaMetrics.lastEventTime,
    };

    const isHealthy = kafkaStatus === 'connected';

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime,
      version: process.env['npm_package_version'] || '1.0.0',
      dependencies: {
        kafka: kafkaStatus,
      },
      metrics: {
        totalEvents: this.metrics.totalEvents,
        successfulEvents: this.metrics.successfulEvents,
        failedEvents: this.metrics.failedEvents,
        ...(this.metrics.lastEventTime && { lastEventTime: this.metrics.lastEventTime }),
      },
    };
  }

  async performHealthCheck(): Promise<boolean> {
    try {
      const healthStatus = this.getHealthStatus();
      
      logger.info('Health check performed', {
        status: healthStatus.status,
        uptime: healthStatus.uptime,
        dependencies: healthStatus.dependencies,
        metrics: healthStatus.metrics,
      });

      return healthStatus.status === 'healthy';
    } catch (error) {
      logger.error('Health check failed', {
        error: error instanceof Error ? error.message : error,
      });
      return false;
    }
  }

  getMetrics() {
    return this.metrics;
  }

  updateMetrics(success: boolean): void {
    this.metrics.totalEvents++;
    if (success) {
      this.metrics.successfulEvents++;
    } else {
      this.metrics.failedEvents++;
    }
    this.metrics.lastEventTime = new Date().toISOString();
  }
}

export default HealthCheckService;
