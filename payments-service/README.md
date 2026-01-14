# Payments Service

A Node.js microservice for handling payment processing in a microservices architecture.

## Features

- **JWT Authentication**: Secure token validation using shared secret with auth service
- **Payment Simulation**: 2-second processing delay with 90% approval rate
- **Order Integration**: Automatic status updates to Orders service via webhook
- **Database Persistence**: PostgreSQL with Sequelize ORM
- **Docker Support**: Multi-stage Dockerfile with health checks
- **Error Handling**: Comprehensive error handling and logging
- **API Documentation**: RESTful API with clear endpoints

## API Endpoints

### Protected Endpoints (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments` | Create a new payment |
| GET | `/api/payments` | List user payments (with pagination) |
| GET | `/api/payments/stats` | Get payment statistics for user |
| GET | `/api/payments/:id` | Get specific payment details |

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |
| GET | `/` | API information and endpoints |

## Payment Flow

1. **Create Payment**: Client sends `POST /api/payments` with order_id and amount
2. **JWT Validation**: Middleware validates the token
3. **Payment Creation**: Creates PENDING payment record with unique transaction_id
4. **Async Processing**: Simulates 2-second bank processing delay
5. **Random Result**: 90% approval, 10% rejection rate
6. **Status Update**: Updates payment status in database
7. **Webhook**: Notifies Orders service of payment result
8. **Final Status**: Payment marked as APPROVED or REJECTED

## Payment Schema

```json
{
  "id": 1,
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user123",
  "amount": 99.99,
  "status": "PENDING|APPROVED|REJECTED",
  "transaction_id": "txn_12345678-1234-1234-1234-123456789012",
  "created_at": "2023-12-07T10:30:00.000Z",
  "updated_at": "2023-12-07T10:32:00.000Z"
}
```

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose

### Local Development

1. **Install Dependencies**:
   ```bash
   cd payments-service
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start PostgreSQL** (if using local):
   ```bash
   docker run --name payments_db_local \
     -e POSTGRES_DB=payments_db \
     -e POSTGRES_USER=payments_user \
     -e POSTGRES_PASSWORD=payments_password \
     -p 5435:5432 \
     postgres:15-alpine
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

### Docker Development

1. **Build and Start Services**:
   ```bash
   docker-compose up --build -d
   ```

2. **View Logs**:
   ```bash
   docker-compose logs -f payments_service
   ```

3. **Stop Services**:
   ```bash
   docker-compose down
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Service port | 3000 |
| `NODE_ENV` | Environment | development |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT secret (must match auth service) | - |
| `ORDERS_SERVICE_URL` | Orders service URL | http://orders-service:8080 |
| `PAYMENT_APPROVAL_RATE` | Approval rate percentage | 90 |
| `PAYMENT_PROCESSING_DELAY` | Processing delay in ms | 2000 |

## Integration with Microservices

### JWT Authentication
- Uses the same JWT secret as the auth service
- Validates Bearer tokens in Authorization header
- Extracts user ID from token sub claim

### Orders Service Communication
- Sends PATCH requests to `/api/v1/orders/{orderId}/status`
- Updates order status to `PAID` for approved payments
- Updates order status to `PAYMENT_FAILED` for rejected payments

### Database Schema
- PostgreSQL database with payments table
- Indexes on user_id, order_id, status, and transaction_id
- Automatic timestamps and trigger for updated_at

## Error Handling

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (invalid token)
- `404`: Not Found
- `500`: Internal Server Error
- `503`: Service Unavailable (external service down)

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "error": "Error message (if applicable)",
  "message": "Detailed description (if applicable)"
}
```

## Testing

### Run Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Linting
```bash
npm run lint
```

### Fix Linting Issues
```bash
npm run lint:fix
```

## Monitoring

### Health Checks
- `/health` endpoint returns service status
- Docker health checks monitor service availability
- Database connection verification

### Logging
- HTTP request logging with Morgan
- Error logging with context
- Payment processing events

## Deployment

### Production Deployment
1. Build Docker image:
   ```bash
   docker build -t payments-service:latest .
   ```

2. Run with Docker Compose:
   ```bash
   NODE_ENV=production docker-compose up -d
   ```

3. Verify health:
   ```bash
   curl http://localhost:8003/health
   ```

### Scaling
- Supports horizontal scaling behind load balancer
- Database connection pooling configured
- Stateless service design

## Security

- JWT token validation
- Input sanitization
- SQL injection prevention via Sequelize ORM
- Rate limiting (to be implemented)
- HTTPS in production (recommended)

## Troubleshooting

### Common Issues

1. **Database Connection**:
   - Check DATABASE_URL environment variable
   - Verify PostgreSQL container is running
   - Check database credentials

2. **JWT Validation**:
   - Verify JWT_SECRET matches auth service
   - Check token format (Bearer token)
   - Verify token hasn't expired

3. **Orders Service Communication**:
   - Check ORDERS_SERVICE_URL
   - Verify network connectivity
   - Check Orders service health

4. **Docker Issues**:
   - Check Docker logs: `docker-compose logs payments_service`
   - Verify container health: `docker ps`
   - Check resource usage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run linting and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details.