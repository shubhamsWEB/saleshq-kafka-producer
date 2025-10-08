export interface CustomPixelEvent {
  id: string;
  topic: string;
  shop: string;
  payload: Record<string, any>;
  timestamp: string;
  apiVersion: string;
  webhookId: string;
}

export interface KafkaMessage {
  key: string;
  value: CustomPixelEvent;
  headers?: Record<string, string>;
  timestamp?: number;
}

export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  groupId: string;
  topicPrefix: string;
  partitions: number;
  replicationFactor: number;
}

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  logLevel: string;
  logFormat: string;
}

export interface HealthCheckConfig {
  interval: number;
  timeout: number;
}

export interface WebhookConfig {
  path: string;
  timeout: number;
}

export interface AppConfig {
  server: ServerConfig;
  kafka: KafkaConfig;
  healthCheck: HealthCheckConfig;
  webhook: WebhookConfig;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  dependencies: {
    kafka: 'connected' | 'disconnected' | 'unknown';
  };
  metrics: {
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    lastEventTime?: string;
  };
}

export interface EventProcessor {
  topic: string;
  process(event: CustomPixelEvent): Promise<KafkaMessage>;
}

export interface AnalyticsEvent {
  eventType: string;
  shopDomain: string;
  timestamp: string;
  data: Record<string, any>;
  metadata: {
    webhookId: string;
    apiVersion: string;
    correlationId: string;
  };
}

export interface KafkaTopicMapping {
  [key: string]: string;
}
