import { CustomPixelEvent } from '../types';
import { KafkaService } from '../services/kafka';

describe('KafkaService', () => {
  let kafkaService: KafkaService;

  beforeEach(() => {
    kafkaService = new KafkaService();
  });

  afterEach(async () => {
    if (kafkaService) {
      await kafkaService.disconnect();
    }
  });

  describe('publishEvent', () => {
    it('should publish event successfully', async () => {
      const mockEvent: CustomPixelEvent = {
        id: 'test-id',
        topic: 'orders/create',
        shop: 'test-shop.myshopify.com',
        payload: { order: { id: 123 } },
        timestamp: new Date().toISOString(),
        apiVersion: '2025-01',
        webhookId: 'webhook-123',
      };

      // Mock the connect method
      jest.spyOn(kafkaService, 'connect').mockResolvedValue(undefined);
      jest.spyOn(kafkaService, 'disconnect').mockResolvedValue(undefined);
      
      // Mock the isConnected property
      Object.defineProperty(kafkaService, 'isConnected', {
        get: jest.fn(() => true),
        configurable: true
      });

      await kafkaService.connect();

      // Mock the producer send method
      const mockProducer = {
        send: jest.fn().mockResolvedValue({}),
      };
      (kafkaService as any).producer = mockProducer;

      await kafkaService.publishEvent(mockEvent);

      expect(mockProducer.send).toHaveBeenCalledWith({
        messages: [{
          topic: 'shopify-analytics-order-events',
          key: 'test-shop.myshopify.com',
          value: mockEvent,
          headers: expect.objectContaining({
            'event-type': 'orders/create',
            'shop-domain': 'test-shop.myshopify.com',
          }),
          timestamp: expect.any(Number),
        }],
        acks: 'all',
      });
    });

    it('should throw error when not connected', async () => {
      const mockEvent: CustomPixelEvent = {
        id: 'test-id',
        topic: 'orders/create',
        shop: 'test-shop.myshopify.com',
        payload: { order: { id: 123 } },
        timestamp: new Date().toISOString(),
        apiVersion: '2025-01',
        webhookId: 'webhook-123',
      };

      await expect(kafkaService.publishEvent(mockEvent)).rejects.toThrow('Kafka service is not connected');
    });
  });

  describe('getMetrics', () => {
    it('should return metrics', () => {
      const metrics = kafkaService.getMetrics();
      
      expect(metrics).toHaveProperty('totalEvents');
      expect(metrics).toHaveProperty('successfulEvents');
      expect(metrics).toHaveProperty('failedEvents');
      expect(metrics).toHaveProperty('isConnected');
    });
  });

  describe('getHealthStatus', () => {
    it('should return disconnected status initially', () => {
      const status = kafkaService.getHealthStatus();
      expect(status).toBe('disconnected');
    });
  });
});
