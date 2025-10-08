// Test setup file
import { jest } from '@jest/globals';

// Mock environment variables
process.env['NODE_ENV'] = 'test';
process.env['PORT'] = '3001';
process.env['KAFKA_BROKERS'] = 'localhost:9092';
process.env['KAFKA_CLIENT_ID'] = 'test-client';
process.env['KAFKA_GROUP_ID'] = 'test-group';
process.env['SHOPIFY_API_KEY'] = 'test-api-key';
process.env['SHOPIFY_API_SECRET'] = 'test-api-secret';
process.env['SHOPIFY_WEBHOOK_SECRET'] = 'test-webhook-secret';
process.env['SHOPIFY_SCOPES'] = 'read_orders,read_products';
process.env['SHOPIFY_API_VERSION'] = '2025-01';
process.env['LOG_LEVEL'] = 'error';
process.env['LOG_FORMAT'] = 'simple';

// Global test timeout
jest.setTimeout(10000);
