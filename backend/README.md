# Restaurant Management Backend

A comprehensive Node.js backend for QR-based restaurant ordering systems with real-time kitchen management, customer tracking, and advanced analytics.

## 🚀 Features

### ✅ Core Functionality
- **QR Code Generation**: Dynamic QR codes for tables, menus, and payments
- **Order Management**: Complete order lifecycle with status tracking
- **Real-time Notifications**: WebSocket-based kitchen and customer updates
- **Table Management**: Occupancy tracking and QR code integration
- **Customer Tracking**: Order status polling and history

### 🔐 Security & Validation
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Super admin, restaurant owner, store admin, staff
- **Input Validation**: Comprehensive validation using Joi schemas
- **Rate Limiting**: IP-based and customer-based rate limiting
- **XSS Protection**: Input sanitization and security middleware
- **WebSocket Security**: JWT verification for real-time connections

### 📊 Analytics & Monitoring
- **Performance Metrics**: Order processing times, completion rates
- **Kitchen Analytics**: Staff performance, efficiency tracking
- **Real-time Monitoring**: Live order tracking and alerts
- **Customer Analytics**: Satisfaction metrics and behavior tracking
- **Comprehensive Logging**: Winston-based logging with rotation

### 🛠️ Enhanced Features
- **Bulk Operations**: Mass order status updates
- **Order Cancellation**: With reason tracking and refund handling
- **Table Utilization**: Real-time occupancy monitoring
- **Preparation Time Estimation**: Smart time calculations
- **Customer Order History**: Authenticated customer tracking

## 🏗️ Architecture

### Models
- **Table**: QR codes, occupancy, status tracking
- **Order**: Complete order lifecycle with status progression
- **User**: Role-based access with restaurant scoping
- **Restaurant**: Multi-store support with settings
- **Product**: Multi-language menu items with customization

### Services
- **QR Service**: Dynamic QR code generation and validation
- **Notification Service**: Real-time WebSocket communication
- **Analytics Service**: Performance monitoring and metrics
- **Logger Service**: Comprehensive logging and monitoring

### Middleware
- **Authentication**: JWT-based secure authentication
- **Validation**: Request/response validation with Joi
- **Rate Limiting**: Multi-tier rate limiting strategies
- **Security**: XSS protection and input sanitization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Redis (optional, for advanced rate limiting)

### Installation

1. **Clone and install dependencies**:
```bash
cd backend
npm install
```

2. **Environment Configuration**:
Create a `.env` file:
```env
# Database
MONGO_URI=mongodb://localhost:27017/restaurant

# Server
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:5173

# QR Code
QR_BASE_URL=http://localhost:3000

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment (optional)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

3. **Start the server**:
```bash
# Development
npm run dev

# Production
npm start

# With nodemon
npm run start
```

## 📋 API Endpoints

### Public Endpoints (No Authentication)
```
GET  /api/public/menu/:restaurantId/:storeId
GET  /api/public/qr/validate/:qrCode
POST /api/public/orders
GET  /api/public/orders/:orderId/status
GET  /api/public/restaurant/:code
```

### Authenticated Endpoints
```
# Orders
POST   /api/orders
GET    /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id
DELETE /api/orders/:id
PUT    /api/orders/:id/status
PUT    /api/orders/:id/cancel
PUT    /api/orders/bulk/status

# Kitchen
GET    /api/orders/kitchen/pending
GET    /api/orders/kitchen/stats
GET    /api/orders/kitchen/restaurant/:restaurantId
PUT    /api/orders/kitchen/:id/prepare
PUT    /api/orders/kitchen/:id/ready

# Customer Tracking
GET    /api/orders/status/:orderId
GET    /api/orders/customer/:phone
```

## 🔧 Configuration

### Rate Limiting
- **API**: 100 requests per 15 minutes per IP
- **Orders**: 10 requests per 5 minutes per IP
- **Customers**: 50 requests per hour per customer
- **Kitchen**: 200 requests per 15 minutes per IP
- **Authentication**: 5 attempts per 15 minutes per IP

### Order Status Flow
```
pending → confirmed → preparing → ready → served/delivered
     ↓
  cancelled (with reason)
```

### WebSocket Events
- **Kitchen**: `order_notification`, `status_update`, `order_ready`
- **Customers**: `order_update`, `customer_notification`, `estimated_time_update`

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Test Structure
```
src/__tests__/
├── services/
│   ├── qrService.test.ts
│   ├── notificationService.test.ts
│   └── analyticsService.test.ts
├── controllers/
│   ├── OrderController.test.ts
│   └── PublicController.test.ts
└── middleware/
    ├── auth.test.ts
    └── validation.test.ts
```

## 📊 Monitoring & Analytics

### Real-time Metrics
- Order processing times
- Kitchen efficiency
- Table utilization
- Customer satisfaction
- Peak hour identification

### Automated Alerts
- High pending orders (>10)
- Long wait times (>30 minutes)
- Low completion rates
- System performance issues

### Logging
- **Error Logs**: `logs/error-YYYY-MM-DD.log`
- **HTTP Logs**: `logs/http-YYYY-MM-DD.log`
- **Combined Logs**: `logs/combined-YYYY-MM-DD.log`

## 🔐 Security Features

### Authentication
- JWT tokens with configurable expiration
- Role-based access control
- Session management for WebSocket connections
- Password hashing with bcrypt

### Input Validation
- Comprehensive request validation using Joi
- XSS protection with input sanitization
- SQL injection prevention
- Rate limiting per IP and customer

### WebSocket Security
- JWT verification for authenticated connections
- Restaurant-scoped access control
- Session timeout and cleanup
- Activity logging and monitoring

## 🚀 Production Deployment

### Environment Variables
```env
NODE_ENV=production
MONGO_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Performance Optimization
- Database indexing for common queries
- Caching for analytics and metrics
- Connection pooling for MongoDB
- Rate limiting and request throttling

### Monitoring
- Winston logging with rotation
- Performance metrics collection
- Error tracking and alerting
- Real-time system monitoring

## 📈 Analytics Dashboard

### Kitchen Performance
- Orders completed per hour
- Average preparation time
- Staff efficiency metrics
- Cancellation rates

### Customer Analytics
- Order frequency patterns
- Peak ordering hours
- Popular menu items
- Customer satisfaction scores

### Business Metrics
- Revenue per hour
- Table utilization rates
- Order completion rates
- Customer retention data

## 🔄 Development Workflow

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npx tsc --noEmit
```

### Testing Strategy
- Unit tests for services and utilities
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance testing for high-load scenarios

## 📝 API Documentation

### Order Creation
```json
POST /api/orders
{
  "restaurantId": "restaurant-id",
  "storeId": "store-id",
  "tableNumber": "table-1",
  "customerInfo": {
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com"
  },
  "items": [
    {
      "productId": "product-id",
      "quantity": 2,
      "addOns": [
        {
          "name": "Extra cheese",
          "price": 1.50,
          "quantity": 1
        }
      ],
      "notes": "No onions please"
    }
  ],
  "orderType": "dine_in",
  "customerNotes": "Please deliver to table"
}
```

### Order Status Update
```json
PUT /api/orders/:id/status
{
  "status": "preparing",
  "assignedTo": "staff-user-id",
  "estimatedTime": "2024-01-15T14:30:00Z",
  "notes": "Started preparation"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information
4. Include logs and error messages

---

**Built with ❤️ for modern restaurant management** 