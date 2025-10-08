// Enhanced Custom Pixel for Kafka Integration
// This extends your existing custom pixel to send events to your Kafka producer

// Your existing custom pixel code here...
// analytics.subscribe('page_viewed', (event) => {
//   // Your existing tracking code
// });

// Add Kafka producer integration
const KAFKA_PRODUCER_ENDPOINT = 'https://your-kafka-producer-domain.com/webhooks/custom-pixel';

// Function to send events to Kafka producer
async function sendToKafkaProducer(eventType, eventData) {
  try {
    const payload = {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      shop_domain: window.location.hostname,
      session_id: getSessionId(),
      user_id: getUserId(),
      data: eventData
    };

    await fetch(KAFKA_PRODUCER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Topic': 'custom_pixel_events',
        'X-Shopify-Shop-Domain': window.location.hostname,
        'X-Shopify-Webhook-Id': generateWebhookId(),
        'X-Shopify-API-Version': '2025-01'
      },
      body: JSON.stringify(payload)
    });

    console.log('Event sent to Kafka producer:', eventType);
  } catch (error) {
    console.error('Failed to send event to Kafka producer:', error);
  }
}

// Enhanced event handlers that send to both your existing system AND Kafka
analytics.subscribe('page_viewed', (event) => {
  // Your existing tracking code
  console.log('Page viewed:', event);
  
  // Send to Kafka producer
  sendToKafkaProducer('page_viewed', event);
});

analytics.subscribe('product_viewed', (event) => {
  // Your existing tracking code
  console.log('Product viewed:', event);
  
  // Send to Kafka producer
  sendToKafkaProducer('product_viewed', event);
});

analytics.subscribe('cart_viewed', (event) => {
  // Your existing tracking code
  console.log('Cart viewed:', event);
  
  // Send to Kafka producer
  sendToKafkaProducer('cart_viewed', event);
});

analytics.subscribe('checkout_started', (event) => {
  // Your existing tracking code
  console.log('Checkout started:', event);
  
  // Send to Kafka producer
  sendToKafkaProducer('checkout_started', event);
});

// Utility functions
function getSessionId() {
  return sessionStorage.getItem('shopify_session_id') || generateSessionId();
}

function getUserId() {
  return localStorage.getItem('user_id') || null;
}

function generateSessionId() {
  const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  sessionStorage.setItem('shopify_session_id', sessionId);
  return sessionId;
}

function generateWebhookId() {
  return 'webhook_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
