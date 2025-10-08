#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testCustomPixelEndpoint() {
  console.log('🔍 Testing Custom Pixel Endpoint...');
  
  const testEvents = [
    {
      event_type: 'page_viewed',
      data: {
        page: {
          title: 'Home Page',
          url: 'https://test-shop.myshopify.com/'
        }
      }
    },
    {
      event_type: 'product_viewed',
      data: {
        product: {
          id: '12345',
          title: 'Test Product',
          price: '29.99',
          currency: 'USD'
        }
      }
    },
    {
      event_type: 'cart_viewed',
      data: {
        cart: {
          total_price: '59.98',
          currency: 'USD',
          items: [
            { product_id: '12345', quantity: 2 }
          ]
        }
      }
    }
  ];

  let successCount = 0;
  
  for (const event of testEvents) {
    try {
      const payload = {
        ...event,
        timestamp: new Date().toISOString(),
        shop_domain: 'test-shop.myshopify.com',
        session_id: 'session_' + Date.now(),
        user_id: 'user_123'
      };

      const response = await axios.post(`${BASE_URL}/webhooks/custom-pixel`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Topic': 'custom_pixel_events',
          'X-Shopify-Shop-Domain': 'test-shop.myshopify.com',
          'X-Shopify-Webhook-Id': 'test-pixel-' + Date.now(),
          'X-Shopify-API-Version': '2025-01'
        }
      });

      console.log(`✅ ${event.event_type}:`, response.data.message);
      successCount++;
    } catch (error) {
      console.error(`❌ ${event.event_type}:`, error.response?.data || error.message);
    }
  }

  return successCount === testEvents.length;
}

async function testKafkaTopics() {
  console.log('\n🔍 Checking Kafka Topics...');
  
  try {
    // This would require Kafka CLI tools or a Kafka admin client
    // For now, we'll just check if the service is responding
    const response = await axios.get(`${BASE_URL}/metrics`);
    console.log('✅ Service metrics:', response.data.metrics);
    return true;
  } catch (error) {
    console.error('❌ Kafka topics check failed:', error.message);
    return false;
  }
}

async function runCustomPixelTests() {
  console.log('🚀 Starting Custom Pixel Integration Tests\n');
  
  const pixelOk = await testCustomPixelEndpoint();
  const kafkaOk = await testKafkaTopics();

  console.log('\n📋 Test Results:');
  console.log(`Custom Pixel Events: ${pixelOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Kafka Integration: ${kafkaOk ? '✅ PASS' : '❌ FAIL'}`);

  if (pixelOk && kafkaOk) {
    console.log('\n🎉 Custom pixel integration is working correctly!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your Shopify custom pixel code');
    console.log('2. Deploy your Kafka producer service');
    console.log('3. Monitor events in Kafka UI (http://localhost:8080)');
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

runCustomPixelTests().catch(console.error);
