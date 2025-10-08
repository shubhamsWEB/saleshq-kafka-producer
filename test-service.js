#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testHealthEndpoint() {
  console.log('🔍 Testing Health Endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', response.data.status);
    console.log('📊 Metrics:', response.data.metrics);
    return true;
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
    return false;
  }
}

async function testWebhookEndpoint() {
  console.log('\n🔍 Testing Webhook Endpoint...');
  try {
    const testPayload = {
      id: 12345,
      order_number: "TEST-1001",
      total_price: "29.99",
      currency: "USD",
      customer: {
        id: 67890,
        email: "test@example.com"
      }
    };

    const response = await axios.post(`${BASE_URL}/webhooks/shopify`, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Topic': 'orders/create',
        'X-Shopify-Shop-Domain': 'test-shop.myshopify.com',
        'X-Shopify-Webhook-Id': 'test-webhook-123',
        'X-Shopify-API-Version': '2025-01'
      }
    });

    console.log('✅ Webhook Test Successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Webhook Test Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testMetricsEndpoint() {
  console.log('\n🔍 Testing Metrics Endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/metrics`);
    console.log('✅ Metrics Retrieved:', response.data.metrics);
    return true;
  } catch (error) {
    console.error('❌ Metrics Test Failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Shopify Analytics Producer Tests\n');
  
  const healthOk = await testHealthEndpoint();
  const webhookOk = await testWebhookEndpoint();
  const metricsOk = await testMetricsEndpoint();

  console.log('\n📋 Test Results:');
  console.log(`Health Check: ${healthOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Webhook Test: ${webhookOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Metrics Test: ${metricsOk ? '✅ PASS' : '❌ FAIL'}`);

  if (healthOk && webhookOk && metricsOk) {
    console.log('\n🎉 All tests passed! Your service is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the service logs for details.');
    process.exit(1);
  }
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

runTests().catch(console.error);
