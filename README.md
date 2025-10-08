# Shopify Analytics Kafka Producer

A production-grade Kafka producer service for capturing Shopify store analytics events through webhooks.

## Features

- **Real-time Event Processing**: Captures Shopify webhook events and streams them to Kafka topics
- **Production-Grade Architecture**: Built with TypeScript, comprehensive error handling, and monitoring
- **Scalable Design**: Handles high-volume event streams with proper partitioning
- **Comprehensive Analytics**: Supports all major Shopify webhook events for analytics
- **Health Monitoring**: Built-in health checks and metrics
- **Docker Ready**: Containerized for easy deployment

## Supported Shopify Events

The service captures analytics data for the following Shopify webhook topics:

### Customer Analytics
- `customers/create` - New customer registrations
- `customers/update` - Customer profile updates
- `customers/delete` - Customer account deletions

### Order Analytics
- `orders/create` - New order creation
- `orders/updated` - Order modifications
- `orders/paid` - Payment completion
- `orders/cancelled` - Order cancellations
- `orders/fulfilled` - Order fulfillment

### Product Analytics
- `products/create` - New product creation
- `products/update` - Product modifications
- `products/delete` - Product deletions

### Cart Analytics
- `carts/create` - Cart creation events
- `carts/update` - Cart modification events

### Checkout Analytics
- `checkouts/create` - Checkout initiation
- `checkouts/update` - Checkout modifications
- `checkouts/delete` - Checkout abandonment

### App Analytics
- `app/uninstalled` - App uninstallation events

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Shopify       │    │   Webhook        │    │   Kafka         │
│   Store         │───▶│   Producer       │───▶│   Topics        │
│                 │    │   Service        │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Analytics      │
                       │   Consumers      │
                       └──────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Kafka cluster (local or cloud)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development environment:
   ```bash
   docker-compose up -d
   npm run dev
   ```

### Environment Configuration

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Kafka Configuration
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=shopify-analytics-producer

# Shopify Configuration
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret
SHOPIFY_SCOPES=read_orders,read_products,read_customers

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Project Structure

```
src/
├── config/          # Configuration files
├── services/        # Business logic services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── middleware/      # Express middleware
├── routes/          # API routes
└── test/            # Test files
```

## API Endpoints

### Health Check
- `GET /health` - Service health status
- `GET /metrics` - Service metrics

### Webhook Endpoints
- `POST /webhooks/shopify` - Shopify webhook receiver

## Monitoring

The service includes comprehensive monitoring:

- **Health Checks**: Service availability and dependencies
- **Metrics**: Request rates, error rates, processing times
- **Logging**: Structured logging with correlation IDs
- **Error Tracking**: Detailed error reporting and alerting

## Deployment

### Docker

```bash
docker build -t shopify-analytics-producer .
docker run -p 3000:3000 shopify-analytics-producer
```

### Docker Compose

```bash
docker-compose up -d
```

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
