import { Router, Response } from 'express';
import { RequestWithId } from '../middleware';
import { KafkaService } from '../services/kafka';
import { logger } from '../utils/logger';
import { CustomPixelEvent } from '../types';

export class CustomPixelRoutes {
  private router: Router;
  private kafkaService: KafkaService;

  constructor(kafkaService: KafkaService) {
    this.router = Router();
    this.kafkaService = kafkaService;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/custom-pixel', this.handleCustomPixelEvent.bind(this) as any);
  }

  private async handleCustomPixelEvent(req: RequestWithId, res: Response): Promise<void> {
    try {
      const rawBody = req.body;
      const eventData = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;

      // Create a custom pixel event
      const event: CustomPixelEvent = {
        id: req.headers['x-shopify-webhook-id'] as string || 'custom-pixel-' + Date.now(),
        topic: eventData.event_type || 'custom_pixel_events',
        shop: req.headers['x-shopify-shop-domain'] as string || eventData.shop_domain || 'unknown',
        payload: eventData,
        timestamp: eventData.timestamp || new Date().toISOString(),
        apiVersion: req.headers['x-shopify-api-version'] as string || '2025-01',
        webhookId: req.headers['x-shopify-webhook-id'] as string || 'custom-pixel-' + Date.now(),
      };

      logger.info('Processing custom pixel event', {
        requestId: req.requestId,
        eventType: event.topic,
        shop: event.shop,
        sessionId: eventData.session_id,
        userId: eventData.user_id,
      });

      // Publish to Kafka
      await this.kafkaService.publishEvent(event);

      res.status(200).json({
        success: true,
        requestId: req.requestId,
        eventType: event.topic,
        shop: event.shop,
        message: 'Custom pixel event processed successfully',
      });

    } catch (error) {
      logger.error('Custom pixel event processing failed', {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });

      res.status(500).json({
        error: 'Custom pixel event processing failed',
        requestId: req.requestId,
      });
    }
  }

  getRouter(): Router {
    return this.router;
  }
}
