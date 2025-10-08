import { Kafka, Producer, Consumer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { appConfig } from '../config';
import { logger } from '../utils/logger';
import { KafkaMessage, CustomPixelEvent, KafkaTopicMapping } from '../types';

export class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private isConnected = false;
  private metrics = {
    totalEvents: 0,
    successfulEvents: 0,
    failedEvents: 0,
    lastEventTime: undefined as string | undefined,
  };

  // Topic mappings for different custom pixel events
  private readonly topicMappings: KafkaTopicMapping = {
    // Custom pixel events
    'custom_pixel_events': 'analytics-events',
    'page_viewed': 'analytics-events',
    'product_viewed': 'analytics-events',
    'cart_viewed': 'analytics-events',
    'checkout_started': 'analytics-events',
  };

  constructor() {
    this.kafka = new Kafka({
      clientId: appConfig.kafka.clientId,
      brokers: appConfig.kafka.brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000,
    });

    this.consumer = this.kafka.consumer({
      groupId: appConfig.kafka.groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      await this.consumer.connect();
      this.isConnected = true;
      logger.info('Connected to Kafka cluster', {
        brokers: appConfig.kafka.brokers,
        clientId: appConfig.kafka.clientId,
      });
    } catch (error) {
      logger.error('Failed to connect to Kafka', { error: error instanceof Error ? error.message : error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from Kafka cluster');
    } catch (error) {
      logger.error('Error disconnecting from Kafka', { error: error instanceof Error ? error.message : error });
    }
  }

  async publishEvent(event: CustomPixelEvent): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Kafka service is not connected');
    }

    const topic = this.getTopicForEvent(event.topic);
    const message: KafkaMessage = {
      key: this.generateMessageKey(event),
      value: event,
      headers: {
        'event-type': event.topic,
        'shop-domain': event.shop,
        'correlation-id': uuidv4(),
        'timestamp': event.timestamp,
      },
      timestamp: Date.now(),
    };

    try {
      await this.producer.send({
        topic,
        messages: [{
          key: message.key,
          value: JSON.stringify(message.value),
          headers: message.headers || {},
          ...(message.timestamp && { timestamp: message.timestamp.toString() }),
        }],
      });

      this.updateMetrics(true);
      logger.info('Event published to Kafka', {
        topic,
        eventType: event.topic,
        shop: event.shop,
        webhookId: event.webhookId,
      });
    } catch (error) {
      this.updateMetrics(false);
      logger.error('Failed to publish event to Kafka', {
        topic,
        eventType: event.topic,
        shop: event.shop,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  private getTopicForEvent(eventTopic: string): string {
    const baseTopic = this.topicMappings[eventTopic] || 'general-events';
    return `${appConfig.kafka.topicPrefix}-${baseTopic}`;
  }

  private generateMessageKey(event: CustomPixelEvent): string {
    // Use shop domain as partition key for even distribution
    return event.shop;
  }

  private updateMetrics(success: boolean): void {
    this.metrics.totalEvents++;
    if (success) {
      this.metrics.successfulEvents++;
    } else {
      this.metrics.failedEvents++;
    }
    this.metrics.lastEventTime = new Date().toISOString();
  }

  getMetrics() {
    return {
      ...this.metrics,
      isConnected: this.isConnected,
    };
  }

  getHealthStatus(): 'connected' | 'disconnected' | 'unknown' {
    return this.isConnected ? 'connected' : 'disconnected';
  }

  // Method to create topics (useful for initialization)
  async createTopics(): Promise<void> {
    const topics = Object.values(this.topicMappings).map(topic => 
      `${appConfig.kafka.topicPrefix}-${topic}`
    );

    logger.info('Creating Kafka topics', { topics });
    
    // Note: KafkaJS doesn't have built-in topic creation
    // Topics should be created externally or through Kafka admin tools
    // This is a placeholder for topic creation logic
  }
}

export default KafkaService;
