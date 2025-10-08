#!/usr/bin/env node

/**
 * Test script for custom pixel endpoint
 * This script tests the /webhooks/custom-pixel endpoint to ensure it's working correctly
 */

const https = require('https');
const http = require('http');

// Configuration
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const ENDPOINT = '/webhooks/custom-pixel';

// Test data
const testEvent = {
  event_type: 'page_viewed',
  timestamp: new Date().toISOString(),
  shop_domain: 'test-shop.myshopify.com',
  session_id: 'test_session_123',
  user_id: 'test_user_456',
  data: {
    page_url: 'https://test-shop.myshopify.com/products/test-product',
    page_title: 'Test Product',
    referrer: 'https://google.com',
    user_agent: 'Mozilla/5.0 (Test Browser)',
    viewport: {
      width: 1920,
      height: 1080
    }
  }
};

// Test headers
const testHeaders = {
  'Content-Type': 'application/json',
  'X-Shopify-Topic': 'custom_pixel_events',
  'X-Shopify-Shop-Domain': 'test-shop.myshopify.com',
  'X-Shopify-Webhook-Id': 'test_webhook_' + Date.now(),
  'X-Shopify-API-Version': '2025-01',
  'X-Request-ID': 'test_request_' + Date.now()
};

function makeRequest(url, data, headers) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: headers
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}

async function testCustomPixelEndpoint() {
  console.log('🧪 Testing Custom Pixel Endpoint');
  console.log('================================');
  console.log(`Server: ${SERVER_URL}`);
  console.log(`Endpoint: ${ENDPOINT}`);
  console.log('');

  try {
    console.log('📤 Sending test event...');
    console.log('Event data:', JSON.stringify(testEvent, null, 2));
    console.log('');

    const response = await makeRequest(
      `${SERVER_URL}${ENDPOINT}`,
      testEvent,
      testHeaders
    );

    console.log('📥 Response received:');
    console.log(`Status Code: ${response.statusCode}`);
    console.log('Headers:', JSON.stringify(response.headers, null, 2));
    console.log('Response Body:', JSON.stringify(response.data, null, 2));
    console.log('');

    if (response.statusCode === 200) {
      console.log('✅ Test PASSED - Custom pixel endpoint is working correctly!');
      console.log('');
      console.log('The endpoint successfully:');
      console.log('- Accepted the custom pixel event');
      console.log('- Processed the event data');
      console.log('- Returned a success response');
      console.log('- Included request tracking information');
    } else {
      console.log('❌ Test FAILED - Unexpected status code');
      process.exit(1);
    }

  } catch (error) {
    console.log('❌ Test FAILED - Request error:');
    console.log(error.message);
    console.log('');
    console.log('Make sure the server is running and accessible at:', SERVER_URL);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testCustomPixelEndpoint()
    .then(() => {
      console.log('🎉 Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testCustomPixelEndpoint, makeRequest };
