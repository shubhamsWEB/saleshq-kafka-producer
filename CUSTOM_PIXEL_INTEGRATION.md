# 🎯 Custom Pixel + Kafka Producer Integration Guide

## Overview

This guide shows you how to integrate your existing Shopify custom pixel with the Kafka producer service for comprehensive analytics tracking.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Customer      │    │   Custom Pixel   │    │   Kafka         │
│   Browser       │───▶│   (Enhanced)     │───▶│   Producer      │
│                 │    │                  │    │   Service       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │                          │
                              ▼                          ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Your Existing  │    │   Kafka         │
                       │   Analytics      │    │   Topics        │
                       │   System         │    │                 │
                       └──────────────────┘    └─────────────────┘
```

## 🚀 Implementation Steps

### Step 1: Update Your Custom Pixel

Replace your existing custom pixel code with the enhanced version:

```javascript
// In your Shopify admin > Online Store > Preferences > Customer events

// Your existing analytics code (keep this)
analytics.subscribe('page_viewed', (event) => {
  // Your existing tracking code
  console.log('Page viewed:', event);
});

// Add Kafka producer integration
const KAFKA_PRODUCER_ENDPOINT = 'https://your-domain.com/webhooks/custom-pixel';

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

// Enhanced event handlers
analytics.subscribe('page_viewed', (event) => {
  // Your existing code
  console.log('Page viewed:', event);
  
  // Send to Kafka
  sendToKafkaProducer('page_viewed', event);
});

analytics.subscribe('product_viewed', (event) => {
  console.log('Product viewed:', event);
  sendToKafkaProducer('product_viewed', event);
});

analytics.subscribe('cart_viewed', (event) => {
  console.log('Cart viewed:', event);
  sendToKafkaProducer('cart_viewed', event);
});

analytics.subscribe('checkout_started', (event) => {
  console.log('Checkout started:', event);
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
```

### Step 2: Deploy Your Kafka Producer

```bash
# Build and deploy your service
npm run build
docker-compose up -d

# Or deploy to your cloud provider
# (AWS, GCP, Azure, etc.)
```

### Step 3: Update Your Domain

Update the `KAFKA_PRODUCER_ENDPOINT` in your custom pixel to point to your deployed service:

```javascript
const KAFKA_PRODUCER_ENDPOINT = 'https://your-actual-domain.com/webhooks/custom-pixel';
```

## 🧪 Testing the Integration

### 1. Test Custom Pixel Events

```bash
# Test the custom pixel endpoint
curl -X POST http://localhost:3000/webhooks/custom-pixel \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: custom_pixel_events" \
  -H "X-Shopify-Shop-Domain: test-shop.myshopify.com" \
  -H "X-Shopify-Webhook-Id: test-pixel-123" \
  -H "X-Shopify-API-Version: 2025-01" \
  -d '{
    "event_type": "page_viewed",
    "timestamp": "2025-01-07T10:00:00Z",
    "shop_domain": "test-shop.myshopify.com",
    "session_id": "session_123",
    "user_id": "user_456",
    "data": {
      "page": {
        "title": "Test Page",
        "url": "https://test-shop.myshopify.com/products/test"
      }
    }
  }'
```

### 2. Monitor Kafka Topics

```bash
# Watch analytics events
docker exec kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic shopify-analytics-analytics-events \
  --from-beginning
```

### 3. Check Service Health

```bash
curl http://localhost:3000/health
```

## 📊 Event Types You'll Capture

### Custom Pixel Events (Real-time)
- `page_viewed` - Page visits
- `product_viewed` - Product page views
- `cart_viewed` - Cart page views
- `checkout_started` - Checkout initiation
- `search_submitted` - Search queries
- `collection_viewed` - Collection page views

### Webhook Events (Server-side)
- `orders/create` - New orders
- `orders/paid` - Payment completion
- `customers/create` - New customers
- `products/create` - New products
- `carts/create` - Cart creation

## 🎯 Benefits of This Approach

### ✅ Advantages
1. **Comprehensive Coverage**: Both client-side and server-side events
2. **Real-time Analytics**: Immediate event capture from custom pixel
3. **Minimal Changes**: Keep your existing pixel functionality
4. **Scalable**: Kafka handles high-volume event streams
5. **Flexible**: Easy to add new event types

### 📈 Analytics Capabilities
- **Customer Journey Tracking**: From page view to purchase
- **Real-time Dashboards**: Live analytics updates
- **A/B Testing**: Track experiment performance
- **Conversion Funnels**: Analyze drop-off points
- **Personalization**: Use event data for recommendations

## 🔧 Configuration Options

### Environment Variables

```env
# Add to your .env file
CUSTOM_PIXEL_ENABLED=true
CUSTOM_PIXEL_ENDPOINT=/webhooks/custom-pixel
CUSTOM_PIXEL_TIMEOUT=5000
```

### Kafka Topic Configuration

```typescript
// Analytics events go to: shopify-analytics-analytics-events
// Webhook events go to: shopify-analytics-{type}-events
```

## 🚨 Important Considerations

### 1. **Performance Impact**
- Custom pixel events are sent from customer browsers
- Use async/await to avoid blocking the page
- Implement retry logic for failed requests

### 2. **Privacy Compliance**
- Ensure GDPR/CCPA compliance
- Consider data retention policies
- Implement user consent mechanisms

### 3. **Error Handling**
- Graceful degradation if Kafka producer is down
- Log errors for debugging
- Don't break existing analytics functionality

## 🎉 Next Steps

1. **Deploy**: Get your Kafka producer running
2. **Update Pixel**: Replace your custom pixel code
3. **Test**: Verify events are flowing to Kafka
4. **Monitor**: Set up dashboards and alerts
5. **Scale**: Add more event types as needed

This hybrid approach gives you the best of both worlds: real-time client-side events from your custom pixel AND comprehensive server-side events from webhooks, all streaming to Kafka for powerful analytics processing! 🚀
