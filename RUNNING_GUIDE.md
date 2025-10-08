# Quick Start Guide for Shopify Analytics Kafka Producer

## 🚀 Running the Service

### Option 1: Docker Compose (Recommended)

1. **Configure Environment Variables:**
   ```bash
   # Edit the .env file with your Shopify credentials
   nano .env
   ```

   Required variables:
   ```env
   SHOPIFY_API_KEY=your_shopify_api_key
   SHOPIFY_API_SECRET=your_shopify_api_secret
   SHOPIFY_WEBHOOK_SECRET=your_webhook_secret
   ```

2. **Start the Full Stack:**
   ```bash
   docker-compose up -d
   ```

   This starts:
   - Zookeeper
   - Kafka
   - Kafka UI (http://localhost:8080)
   - Shopify Producer Service (http://localhost:3000)

3. **Check Service Status:**
   ```bash
   curl http://localhost:3000/health
   ```

### Option 2: Local Development

1. **Start Kafka Locally:**
   ```bash
   # Start Zookeeper and Kafka using Docker Compose
   docker-compose up -d zookeeper kafka kafka-ui
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

## 🧪 Testing the Service

### 1. Health Check Tests

```bash
# Check if service is running
curl http://localhost:3000/health

# Check readiness
curl http://localhost:3000/ready

# Check liveness
curl http://localhost:3000/live

# Get metrics
curl http://localhost:3000/metrics
```

### 2. Webhook Testing

**Test Shopify Webhook Endpoint:**
```bash
# Simulate a Shopify webhook
curl -X POST http://localhost:3000/webhooks/shopify \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: orders/create" \
  -H "X-Shopify-Shop-Domain: test-shop.myshopify.com" \
  -H "X-Shopify-Webhook-Id: test-webhook-123" \
  -H "X-Shopify-API-Version: 2025-01" \
  -d '{
    "id": 12345,
    "order_number": "1001",
    "total_price": "29.99",
    "currency": "USD",
    "customer": {
      "id": 67890,
      "email": "customer@example.com"
    }
  }'
```

### 3. Kafka Topic Verification

**Using Kafka UI (http://localhost:8080):**
1. Open Kafka UI in your browser
2. Navigate to "Topics"
3. Look for topics like:
   - `shopify-analytics-order-events`
   - `shopify-analytics-customer-events`
   - `shopify-analytics-product-events`

**Using Kafka CLI:**
```bash
# List topics
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Consume messages from a topic
docker exec kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic shopify-analytics-order-events \
  --from-beginning
```

### 4. Unit Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### 5. Integration Testing

**Test Webhook Processing:**
```bash
# Create a test script
cat > test-webhook.js << 'EOF'
const axios = require('axios');

async function testWebhook() {
  try {
    const response = await axios.post('http://localhost:3000/webhooks/shopify', {
      id: 12345,
      order_number: "1001",
      total_price: "29.99",
      currency: "USD"
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Topic': 'orders/create',
        'X-Shopify-Shop-Domain': 'test-shop.myshopify.com',
        'X-Shopify-Webhook-Id': 'test-webhook-123',
        'X-Shopify-API-Version': '2025-01'
      }
    });
    
    console.log('Webhook test successful:', response.data);
  } catch (error) {
    console.error('Webhook test failed:', error.response?.data || error.message);
  }
}

testWebhook();
EOF

# Run the test
node test-webhook.js
```

## 🔍 Monitoring and Debugging

### 1. View Logs

**Docker Compose:**
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f shopify-producer
```

**Local Development:**
```bash
# Logs are displayed in the terminal when running npm run dev
```

### 2. Check Service Health

```bash
# Comprehensive health check
curl http://localhost:3000/health | jq

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-07T...",
  "uptime": 12345,
  "version": "1.0.0",
  "dependencies": {
    "kafka": "connected",
    "shopify": "connected"
  },
  "metrics": {
    "totalEvents": 0,
    "successfulEvents": 0,
    "failedEvents": 0
  }
}
```

### 3. Monitor Kafka Messages

**Real-time message monitoring:**
```bash
# Monitor all shopify analytics topics
docker exec kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic shopify-analytics-order-events \
  --from-beginning \
  --property print.key=true \
  --property print.value=true
```

## 🛠️ Development Workflow

### 1. Making Changes

```bash
# Start development server with hot reload
npm run dev

# The service will automatically restart on file changes
```

### 2. Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check
```

### 3. Building for Production

```bash
# Build the project
npm run build

# Start production server
npm start
```

## 🐛 Troubleshooting

### Common Issues:

1. **Kafka Connection Failed:**
   ```bash
   # Check if Kafka is running
   docker-compose ps
   
   # Restart Kafka
   docker-compose restart kafka
   ```

2. **Webhook Validation Failed:**
   - Ensure `SHOPIFY_WEBHOOK_SECRET` is correctly set
   - Check webhook headers are properly formatted

3. **Port Already in Use:**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   
   # Kill the process or change PORT in .env
   ```

4. **TypeScript Build Errors:**
   ```bash
   # Check for type errors
   npm run type-check
   
   # Fix and rebuild
   npm run build
   ```

## 📊 Expected Behavior

When everything is working correctly:

1. **Service starts** and connects to Kafka
2. **Health checks** return "healthy" status
3. **Webhook endpoint** accepts POST requests
4. **Events are published** to appropriate Kafka topics
5. **Metrics** show successful event processing
6. **Logs** show structured information with correlation IDs

## 🎯 Next Steps

1. **Configure Shopify App:** Set up webhook subscriptions in your Shopify app
2. **Monitor Topics:** Use Kafka UI to monitor message flow
3. **Scale Up:** Add more consumers to process analytics data
4. **Add Alerting:** Set up monitoring for failed events
5. **Deploy:** Use Docker images for production deployment
