# Restaurant Management System - Frontend Integration Guide

## Table of Contents
1. [Legacy Features](#legacy-features)
2. [Newly Implemented Features](#newly-implemented-features)
3. [API Endpoints Overview](#api-endpoints-overview)
4. [Data Schemas](#data-schemas)
5. [Frontend Expected Data Flow](#frontend-expected-data-flow)

---

## Legacy Features

### Core Restaurant Management
- **Restaurant Registration & Management**: Complete restaurant profile creation with multi-language support, unique restaurant codes, and subscription management
- **Store Management**: Multi-location restaurant support with individual store configurations, analytics, and settings
- **Menu Management**: Product and category management with pricing, availability, multi-language names, allergen information, and nutritional data
- **Table Management**: QR code generation for tables, table status tracking, occupancy management, and capacity control
- **Order Processing**: Comprehensive order creation, status updates, payment processing, and receipt generation
- **User Authentication**: JWT-based authentication with role-based access control (super_admin, restaurant_owner, store_admin, staff)
- **Customer Management**: Customer profiles, order history tracking, preferences, and contact information
- **Payment Integration**: Stripe payment gateway integration with transaction tracking and refund handling
- **Feedback System**: Customer feedback collection, rating system, and review management
- **Discount Management**: Advanced promotional system with coupon codes, percentage/fixed discounts, and scheduling
- **Loyalty Program**: Customer loyalty points, rewards system, and tier management

### Advanced User Management & Permissions
- **Role-Based Access Control**: Four distinct user roles with granular permission system
- **Permission Management**: Fine-grained permissions for restaurant, store, product, order, customer, analytics, and payment operations
- **Multi-Location Access**: Staff can be assigned to specific restaurants and stores
- **Profile Management**: User profiles with contact information, verification status, and activity tracking
- **Password Security**: Bcrypt hashing, password reset tokens, and secure authentication

### Sophisticated Discount & Pricing System
- **Multi-Type Discounts**: Percentage, fixed amount, buy-X-get-Y, and free shipping discounts
- **Advanced Targeting**: Discounts can target all products, specific products, categories, or customer groups
- **Scheduling & Recurring**: Time-based discounts with recurring patterns (daily, weekly, monthly)
- **Usage Limits**: Both global and per-customer usage restrictions
- **Conditional Discounts**: Minimum/maximum order amounts, customer type restrictions
- **Priority System**: Multiple discounts with priority-based application
- **Multi-Language Support**: Discount names and descriptions in multiple languages

### Table Management & QR System
- **Smart Table Status**: Real-time tracking of table availability, occupancy, and cleaning status
- **QR Code Integration**: Automatic QR generation with scan tracking and regeneration capabilities
- **Table Capacity Management**: Configurable seating capacity and location categorization
- **Occupancy Tracking**: Automatic table occupation/release based on orders
- **Location Categories**: Indoor, outdoor, bar, window, private, and patio seating areas
- **Analytics Integration**: Table usage statistics and scan count tracking

### Multi-Language & Internationalization
- **Complete RTL Support**: Full Arabic (RTL) language support with proper layout
- **Multi-Language Content**: Product names, descriptions, and discount information in English, Arabic, and German
- **Dynamic UI Adaptation**: Interface elements adapt to language direction and cultural preferences
- **Font Family Management**: Language-specific font rendering and typography

### Product & Category Management
- **Multi-Language Products**: Product names and descriptions in multiple languages
- **Add-On System**: Configurable product add-ons with pricing
- **Allergen Management**: Comprehensive allergen tracking and display
- **Nutritional Information**: Detailed nutritional data for menu items
- **Image Management**: Multiple product images with upload capabilities
- **Availability Control**: Real-time product availability management
- **Preparation Time Tracking**: Estimated preparation times for kitchen planning
- **Category Organization**: Hierarchical category system with product counting

### QR Code System
- **Table QR Codes**: Unique QR codes for each table enabling direct ordering with scan tracking
- **Menu QR Codes**: QR codes linking to restaurant menus with expiration management
- **Payment QR Codes**: QR codes for payment processing and transaction completion
- **QR Analytics**: Scan counting, last scan tracking, and usage analytics
- **QR Security**: Active/inactive status control and expiration date management

## Legacy API Endpoints

### Authentication Endpoints (Legacy)

#### POST `/api/auth/register`
- **Description**: Register new user account
- **Authentication**: Public
- **Request Body**:
```json
{
  "firstName": "Ahmed",
  "lastName": "Mohamed",
  "email": "ahmed@example.com",
  "password": "securePassword123",
  "phone": "+201234567890",
  "role": "staff"
}
```
- **Response**:
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "Ahmed",
    "lastName": "Mohamed",
    "email": "ahmed@example.com",
    "phone": "+201234567890",
    "role": "staff",
    "restaurantId": "507f1f77bcf86cd799439012",
    "isActive": true,
    "emailVerified": false,
    "phoneVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/register/restaurant-owner`
- **Description**: Register restaurant owner account
- **Authentication**: Public
- **Request Body**:
```json
{
  "firstName": "Omar",
  "lastName": "Hassan",
  "email": "omar@restaurant.com",
  "password": "ownerPassword123",
  "phone": "+201987654321",
  "restaurantName": "مطعم الأصالة",
  "cuisine": "شرقي"
}
```
- **Response**:
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439013",
    "firstName": "Omar",
    "lastName": "Hassan",
    "email": "omar@restaurant.com",
    "role": "restaurant_owner",
    "restaurantId": "507f1f77bcf86cd799439014",
    "permissions": ["restaurant:read", "restaurant:write", "store:read", "store:write"]
  },
  "restaurant": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "مطعم الأصالة",
    "restaurantCode": "REST001",
    "ownerId": "507f1f77bcf86cd799439013"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/register/kitchen-staff`
- **Description**: Register kitchen staff account
- **Authentication**: Public
- **Request Body**:
```json
{
  "firstName": "Fatima",
  "lastName": "Ali",
  "email": "fatima@restaurant.com",
  "password": "kitchenPassword123",
  "phone": "+201555666777",
  "restaurantId": "507f1f77bcf86cd799439014",
  "storeId": "507f1f77bcf86cd799439015"
}
```
- **Response**:
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439016",
    "firstName": "Fatima",
    "lastName": "Ali",
    "email": "fatima@restaurant.com",
    "role": "staff",
    "restaurantId": "507f1f77bcf86cd799439014",
    "storeId": "507f1f77bcf86cd799439015",
    "permissions": ["order:read", "order:write", "product:read"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/register/staff-by-code`
- **Description**: Register staff using restaurant code
- **Authentication**: Public
- **Request Body**:
```json
{
  "firstName": "Mahmoud",
  "lastName": "Ibrahim",
  "email": "mahmoud@example.com",
  "password": "staffPassword123",
  "phone": "+201444555666",
  "restaurantCode": "REST001"
}
```
- **Response**:
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439017",
    "firstName": "Mahmoud",
    "lastName": "Ibrahim",
    "email": "mahmoud@example.com",
    "role": "staff",
    "restaurantId": "507f1f77bcf86cd799439014",
    "permissions": ["order:read", "order:write", "product:read"]
  },
  "restaurant": {
    "name": "مطعم الأصالة",
    "restaurantCode": "REST001"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### PUT `/api/auth/profile`
- **Description**: Update user profile
- **Authentication**: JWT required
- **Request Body**:
```json
{
  "firstName": "Ahmed",
  "lastName": "Mohamed Updated",
  "phone": "+201234567890",
  "profileImage": "https://example.com/profile.jpg"
}
```
- **Response**:
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "Ahmed",
    "lastName": "Mohamed Updated",
    "email": "ahmed@example.com",
    "phone": "+201234567890",
    "profileImage": "https://example.com/profile.jpg",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### PUT `/api/auth/change-password`
- **Description**: Change user password
- **Authentication**: JWT required
- **Request Body**:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456",
  "confirmPassword": "newSecurePassword456"
}
```
- **Response**:
```json
{
  "message": "Password changed successfully"
}
```

### Restaurant Management Endpoints (Legacy)

#### GET `/api/restaurants/code/:code`
- **Description**: Get restaurant by code (public for staff access)
- **Authentication**: Public
- **Example**: `/api/restaurants/code/REST001`
- **Response**:
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "name": "مطعم الأصالة",
  "description": "مطعم متخصص في الأكلات الشرقية الأصيلة",
  "restaurantCode": "REST001",
  "cuisine": "شرقي",
  "address": {
    "street": "شارع التحرير",
    "city": "القاهرة",
    "state": "القاهرة",
    "country": "مصر",
    "zipCode": "11511"
  },
  "contact": {
    "phone": "+201234567890",
    "email": "info@alasala.com",
    "website": "www.alasala.com"
  },
  "logo": "https://example.com/logo.png",
  "isActive": true,
  "isVerified": true
}
```

#### GET `/api/restaurants/validate/:code`
- **Description**: Validate restaurant code
- **Authentication**: Public
- **Example**: `/api/restaurants/validate/REST001`
- **Response** (Valid):
```json
{
  "valid": true,
  "restaurant": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "مطعم الأصالة",
    "restaurantCode": "REST001"
  }
}
```
- **Response** (Invalid):
```json
{
  "valid": false,
  "message": "رمز المطعم غير صحيح أو غير موجود"
}
```

#### GET `/api/restaurants/:id/code`
- **Description**: Get restaurant code for owner
- **Authentication**: JWT required
- **Example**: `/api/restaurants/507f1f77bcf86cd799439014/code`
- **Response**:
```json
{
  "restaurantCode": "REST001",
  "restaurant": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "مطعم الأصالة"
  }
}
```

#### GET `/api/restaurants/:id/analytics`
- **Description**: Get restaurant analytics
- **Authentication**: JWT required
- **Query Parameters**:
  - `period` (optional): `today`, `week`, `month`, `year`
  - `startDate` (optional): Start date in YYYY-MM-DD format
  - `endDate` (optional): End date in YYYY-MM-DD format
- **Example**: `/api/restaurants/507f1f77bcf86cd799439014/analytics?period=month`
- **Response**:
```json
{
  "period": "month",
  "totalOrders": 1250,
  "totalRevenue": 45750.50,
  "averageOrderValue": 36.60,
  "topProducts": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "name": {"en": "Chicken Shawarma", "ar": "شاورما دجاج"},
      "ordersCount": 250,
      "revenue": 3750.00
    }
  ],
  "ordersByStatus": {
    "completed": 1100,
    "cancelled": 50,
    "pending": 100
  },
  "revenueByDay": [
    {"date": "2024-01-01", "revenue": 1520.50},
    {"date": "2024-01-02", "revenue": 1750.25}
  ],
  "customerStats": {
    "newCustomers": 45,
    "returningCustomers": 189,
    "totalCustomers": 234
  }
}
```

#### PUT `/api/restaurants/:id/settings`
- **Description**: Update restaurant settings
- **Authentication**: JWT required
- **Request Body**:
```json
{
  "settings": {
    "theme": {
      "primaryColor": "#E53E3E",
      "secondaryColor": "#FBD38D",
      "fontFamily": "Cairo",
      "logoPosition": "center"
    },
    "languages": ["ar", "en", "de"],
    "currency": "EGP",
    "timezone": "Africa/Cairo",
    "taxRate": 14.0,
    "serviceCharge": 12.0,
    "autoAcceptOrders": true,
    "requireCustomerInfo": true,
    "allowTableSelection": true,
    "allowDelivery": true,
    "allowTakeaway": true,
    "maxDeliveryDistance": 10,
    "orderPreparationTime": 25
  }
}
```
- **Response**:
```json
{
  "message": "Restaurant settings updated successfully",
  "restaurant": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "مطعم الأصالة",
    "settings": {
      "theme": {
        "primaryColor": "#E53E3E",
        "secondaryColor": "#FBD38D",
        "fontFamily": "Cairo",
        "logoPosition": "center"
      },
      "languages": ["ar", "en", "de"],
      "currency": "EGP",
      "timezone": "Africa/Cairo",
      "taxRate": 14.0,
      "serviceCharge": 12.0,
      "autoAcceptOrders": true,
      "requireCustomerInfo": true,
      "allowTableSelection": true,
      "allowDelivery": true,
      "allowTakeaway": true,
      "maxDeliveryDistance": 10,
      "orderPreparationTime": 25
    },
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Store Management Endpoints (Legacy)

#### POST `/api/stores`
- **Description**: Create new store
- **Authentication**: JWT required
- **Request Body**:
```json
{
  "name": "فرع المعادي",
  "description": "فرع مطعم الأصالة في المعادي",
  "restaurantId": "507f1f77bcf86cd799439014",
  "address": {
    "street": "شارع 9 المعادي",
    "city": "القاهرة",
    "state": "القاهرة", 
    "country": "مصر",
    "zipCode": "11728",
    "coordinates": [31.2001, 29.9187]
  },
  "contact": {
    "phone": "+201111222333",
    "email": "maadi@alasala.com"
  },
  "operatingHours": {
    "sunday": {"open": "10:00", "close": "23:00", "isOpen": true},
    "monday": {"open": "10:00", "close": "23:00", "isOpen": true},
    "tuesday": {"open": "10:00", "close": "23:00", "isOpen": true},
    "wednesday": {"open": "10:00", "close": "23:00", "isOpen": true},
    "thursday": {"open": "10:00", "close": "23:00", "isOpen": true},
    "friday": {"open": "10:00", "close": "23:30", "isOpen": true},
    "saturday": {"open": "10:00", "close": "23:30", "isOpen": true}
  },
  "capacity": 50,
  "features": ["wifi", "parking", "delivery", "takeaway"],
  "isActive": true
}
```
- **Response**:
```json
{
  "store": {
    "_id": "507f1f77bcf86cd799439015",
    "name": "فرع المعادي",
    "description": "فرع مطعم الأصالة في المعادي",
    "restaurantId": "507f1f77bcf86cd799439014",
    "storeCode": "STORE001",
    "address": {
      "street": "شارع 9 المعادي",
      "city": "القاهرة",
      "state": "القاهرة",
      "country": "مصر",
      "zipCode": "11728",
      "coordinates": [31.2001, 29.9187]
    },
    "contact": {
      "phone": "+201111222333",
      "email": "maadi@alasala.com"
    },
    "operatingHours": {
      "sunday": {"open": "10:00", "close": "23:00", "isOpen": true},
      "monday": {"open": "10:00", "close": "23:00", "isOpen": true},
      "tuesday": {"open": "10:00", "close": "23:00", "isOpen": true},
      "wednesday": {"open": "10:00", "close": "23:00", "isOpen": true},
      "thursday": {"open": "10:00", "close": "23:00", "isOpen": true},
      "friday": {"open": "10:00", "close": "23:30", "isOpen": true},
      "saturday": {"open": "10:00", "close": "23:30", "isOpen": true}
    },
    "capacity": 50,
    "features": ["wifi", "parking", "delivery", "takeaway"],
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/stores`
- **Description**: List stores
- **Authentication**: JWT required
- **Query Parameters**:
  - `restaurantId` (optional): Filter by restaurant
  - `isActive` (optional): Filter by active status
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20)
- **Example**: `/api/stores?restaurantId=507f1f77bcf86cd799439014&isActive=true`
- **Response**:
```json
{
  "stores": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "name": "فرع المعادي",
      "description": "فرع مطعم الأصالة في المعادي",
      "storeCode": "STORE001",
      "restaurantId": "507f1f77bcf86cd799439014",
      "address": {
        "street": "شارع 9 المعادي",
        "city": "القاهرة"
      },
      "contact": {
        "phone": "+201111222333"
      },
      "isActive": true,
      "totalTables": 12,
      "totalOrders": 450,
      "monthlyRevenue": 15250.75
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

#### GET `/api/stores/:id`
- **Description**: Get store by ID
- **Authentication**: JWT required
- **Example**: `/api/stores/507f1f77bcf86cd799439015`
- **Response**:
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "name": "فرع المعادي",
  "description": "فرع مطعم الأصالة في المعادي",
  "storeCode": "STORE001",
  "restaurantId": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "مطعم الأصالة",
    "restaurantCode": "REST001"
  },
  "address": {
    "street": "شارع 9 المعادي",
    "city": "القاهرة",
    "state": "القاهرة",
    "country": "مصر",
    "zipCode": "11728",
    "coordinates": [31.2001, 29.9187]
  },
  "contact": {
    "phone": "+201111222333",
    "email": "maadi@alasala.com"
  },
  "operatingHours": {
    "sunday": {"open": "10:00", "close": "23:00", "isOpen": true},
    "monday": {"open": "10:00", "close": "23:00", "isOpen": true},
    "tuesday": {"open": "10:00", "close": "23:00", "isOpen": true},
    "wednesday": {"open": "10:00", "close": "23:00", "isOpen": true},
    "thursday": {"open": "10:00", "close": "23:00", "isOpen": true},
    "friday": {"open": "10:00", "close": "23:30", "isOpen": true},
    "saturday": {"open": "10:00", "close": "23:30", "isOpen": true}
  },
  "capacity": 50,
  "features": ["wifi", "parking", "delivery", "takeaway"],
  "isActive": true,
  "stats": {
    "totalTables": 12,
    "occupiedTables": 3,
    "totalOrders": 450,
    "todayOrders": 25,
    "monthlyRevenue": 15250.75,
    "averageOrderValue": 33.89
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

#### PUT `/api/stores/:id`
- **Description**: Update store
- **Authentication**: JWT required
- **Request Body**:
```json
{
  "name": "فرع المعادي - محدث",
  "description": "فرع مطعم الأصالة في المعادي مع خدمة توصيل محسنة",
  "address": {
    "street": "شارع 9 المعادي - العمارة الجديدة",
    "city": "القاهرة",
    "state": "القاهرة",
    "country": "مصر",
    "zipCode": "11728",
    "coordinates": [31.2001, 29.9187]
  },
  "contact": {
    "phone": "+201111222333",
    "email": "maadi@alasala.com"
  },
  "operatingHours": {
    "sunday": {"open": "09:00", "close": "24:00", "isOpen": true},
    "monday": {"open": "09:00", "close": "24:00", "isOpen": true},
    "tuesday": {"open": "09:00", "close": "24:00", "isOpen": true},
    "wednesday": {"open": "09:00", "close": "24:00", "isOpen": true},
    "thursday": {"open": "09:00", "close": "24:00", "isOpen": true},
    "friday": {"open": "09:00", "close": "01:00", "isOpen": true},
    "saturday": {"open": "09:00", "close": "01:00", "isOpen": true}
  },
  "capacity": 60,
  "features": ["wifi", "parking", "delivery", "takeaway", "outdoor_seating"]
}
```
- **Response**:
```json
{
  "message": "Store updated successfully",
  "store": {
    "_id": "507f1f77bcf86cd799439015",
    "name": "فرع المعادي - محدث",
    "description": "فرع مطعم الأصالة في المعادي مع خدمة توصيل محسنة",
    "storeCode": "STORE001",
    "capacity": 60,
    "features": ["wifi", "parking", "delivery", "takeaway", "outdoor_seating"],
    "updatedAt": "2024-01-01T15:30:00.000Z"
  }
}
```

#### DELETE `/api/stores/:id`
- **Description**: Delete store
- **Authentication**: JWT required
- **Example**: `/api/stores/507f1f77bcf86cd799439015`
- **Response**:
```json
{
  "message": "Store deleted successfully",
  "deletedStore": {
    "_id": "507f1f77bcf86cd799439015",
    "name": "فرع المعادي"
  }
}
```

#### GET `/api/stores/:id/analytics`
- **Description**: Get store analytics
- **Authentication**: JWT required
- **Query Parameters**:
  - `period` (optional): `today`, `week`, `month`, `year`
  - `startDate` (optional): Start date in YYYY-MM-DD format
  - `endDate` (optional): End date in YYYY-MM-DD format
- **Example**: `/api/stores/507f1f77bcf86cd799439015/analytics?period=week`
- **Response**:
```json
{
  "storeId": "507f1f77bcf86cd799439015",
  "storeName": "فرع المعادي",
  "period": "week",
  "analytics": {
    "orders": {
      "total": 175,
      "completed": 165,
      "cancelled": 10,
      "averageOrderValue": 42.50
    },
    "revenue": {
      "total": 7437.50,
      "daily": [
        {"date": "2024-01-01", "revenue": 1250.00, "orders": 30},
        {"date": "2024-01-02", "revenue": 1100.00, "orders": 25},
        {"date": "2024-01-03", "revenue": 1350.00, "orders": 32}
      ]
    },
    "tables": {
      "total": 12,
      "averageOccupancy": 65.5,
      "mostPopular": [
        {"tableNumber": "A5", "orders": 15},
        {"tableNumber": "B3", "orders": 12}
      ]
    },
    "customers": {
      "total": 145,
      "new": 25,
      "returning": 120
    },
    "topProducts": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "name": {"en": "Chicken Shawarma", "ar": "شاورما دجاج"},
        "orders": 45,
        "revenue": 675.00
      }
    ]
  }
}
```

#### POST `/api/stores/:id/qr-codes`
- **Description**: Create QR codes for store
- **Authentication**: JWT required
- **Request Body**:
```json
{
  "type": "menu", // "menu", "table", "payment"
  "quantity": 10,
  "configuration": {
    "size": 200,
    "format": "png",
    "includeStoreName": true,
    "includeStoreContact": true
  }
}
```
- **Response**:
```json
{
  "message": "QR codes generated successfully",
  "qrCodes": [
    {
      "id": "qr_001",
      "type": "menu",
      "code": "STORE001_MENU_001",
      "url": "https://example.com/menu/507f1f77bcf86cd799439015",
      "qrCodeData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "downloadUrl": "https://example.com/downloads/qr-codes-batch-12345.zip"
}
```

### Category Management Endpoints (Legacy)

#### POST `/api/categories`
- **Description**: Create new category
- **Authentication**: JWT required
- **Request Body**:
```json
{
  "restaurantId": "507f1f77bcf86cd799439014",
  "name": {
    "en": "Main Dishes",
    "ar": "الأطباق الرئيسية",
    "de": "Hauptgerichte"
  },
  "description": {
    "en": "Traditional main dishes and meals",
    "ar": "الأطباق الرئيسية التقليدية والوجبات",
    "de": "Traditionelle Hauptgerichte und Mahlzeiten"
  },
  "image": "https://example.com/categories/main-dishes.jpg",
  "icon": "🍽️",
  "isActive": true,
  "isFeatured": true,
  "displayOrder": 1
}
```
- **Response**:
```json
{
  "category": {
    "_id": "507f1f77bcf86cd799439025",
    "restaurantId": "507f1f77bcf86cd799439014",
    "name": {
      "en": "Main Dishes",
      "ar": "الأطباق الرئيسية",
      "de": "Hauptgerichte"
    },
    "description": {
      "en": "Traditional main dishes and meals",
      "ar": "الأطباق الرئيسية التقليدية والوجبات",
      "de": "Traditionelle Hauptgerichte und Mahlzeiten"
    },
    "image": "https://example.com/categories/main-dishes.jpg",
    "icon": "🍽️",
    "isActive": true,
    "isFeatured": true,
    "displayOrder": 1,
    "productCount": 0,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/categories`
- **Description**: List categories
- **Authentication**: JWT required
- **Query Parameters**: Filtering options
- **Response**: List of categories

#### GET `/api/categories/:id`
- **Description**: Get category by ID
- **Authentication**: JWT required
- **Response**: Category details

#### PUT `/api/categories/:id`
- **Description**: Update category
- **Authentication**: JWT required
- **Request Body**: Updated category data

#### DELETE `/api/categories/:id`
- **Description**: Delete category
- **Authentication**: JWT required
- **Response**: Success message

#### PUT `/api/categories/reorder`
- **Description**: Reorder categories
- **Authentication**: JWT required
- **Request Body**: New category order

#### GET `/api/categories/with-product-count`
- **Description**: Get categories with product count
- **Authentication**: JWT required
- **Response**: Categories with product counts

#### GET `/api/categories/featured`
- **Description**: Get featured categories
- **Authentication**: JWT required
- **Response**: Featured categories

#### GET `/api/categories/stats`
- **Description**: Get category statistics
- **Authentication**: JWT required
- **Response**: Category statistics

### Product Management Endpoints (Legacy)

#### POST `/api/products`
- **Description**: Create new product
- **Authentication**: JWT required
- **Request Body**: Product data with multi-language support

#### GET `/api/products`
- **Description**: List products
- **Authentication**: JWT required
- **Query Parameters**: Filtering options
- **Response**: List of products

#### GET `/api/products/:id`
- **Description**: Get product by ID
- **Authentication**: JWT required
- **Response**: Product details

#### PUT `/api/products/:id`
- **Description**: Update product
- **Authentication**: JWT required
- **Request Body**: Updated product data

#### DELETE `/api/products/:id`
- **Description**: Delete product
- **Authentication**: JWT required
- **Response**: Success message

#### GET `/api/products/popular`
- **Description**: Get popular products
- **Authentication**: JWT required
- **Response**: Popular products list

#### GET `/api/products/new`
- **Description**: Get new products
- **Authentication**: JWT required
- **Response**: New products list

#### GET `/api/products/category/:categoryId`
- **Description**: Get products by category
- **Authentication**: JWT required
- **Response**: Products in category

#### PUT `/api/products/:id/availability`
- **Description**: Update product availability
- **Authentication**: JWT required
- **Request Body**: Availability status

#### POST `/api/products/:id/images`
- **Description**: Add product image
- **Authentication**: JWT required
- **Request Body**: Image data

#### DELETE `/api/products/:id/images/:imageId`
- **Description**: Remove product image
- **Authentication**: JWT required
- **Response**: Success message

### Table Management Endpoints (Legacy)

#### POST `/api/tables`
- **Description**: Create new table
- **Authentication**: JWT required
- **Request Body**: Table data

#### GET `/api/tables/store/:storeId`
- **Description**: List tables for store
- **Authentication**: JWT required
- **Response**: List of tables

#### GET `/api/tables/:id`
- **Description**: Get table by ID
- **Authentication**: JWT required
- **Response**: Table details

#### PUT `/api/tables/:id`
- **Description**: Update table
- **Authentication**: JWT required
- **Request Body**: Updated table data

#### DELETE `/api/tables/:id`
- **Description**: Delete table
- **Authentication**: JWT required
- **Response**: Success message

#### PUT `/api/tables/:id/free`
- **Description**: Free table
- **Authentication**: JWT required
- **Response**: Success message

#### PUT `/api/tables/:id/occupy`
- **Description**: Occupy table
- **Authentication**: JWT required
- **Request Body**: Order ID

#### PUT `/api/tables/:id/qr/regenerate`
- **Description**: Regenerate table QR code
- **Authentication**: JWT required
- **Response**: New QR code

#### GET `/api/tables/store/:storeId/statistics`
- **Description**: Get table statistics for store
- **Authentication**: JWT required
- **Response**: Table statistics

#### POST `/api/tables/bulk`
- **Description**: Create multiple tables
- **Authentication**: JWT required
- **Request Body**: Array of table data

### Customer Management Endpoints (Legacy)

#### POST `/api/customers`
- **Description**: Create new customer
- **Authentication**: JWT required
- **Request Body**: Customer data

#### GET `/api/customers`
- **Description**: List customers
- **Authentication**: JWT required
- **Query Parameters**: Filtering options
- **Response**: List of customers

#### GET `/api/customers/:id`
- **Description**: Get customer by ID
- **Authentication**: JWT required
- **Response**: Customer details

#### PUT `/api/customers/:id`
- **Description**: Update customer
- **Authentication**: JWT required
- **Request Body**: Updated customer data

#### DELETE `/api/customers/:id`
- **Description**: Delete customer
- **Authentication**: JWT required
- **Response**: Success message

#### GET `/api/customers/:id/orders`
- **Description**: Get customer orders
- **Authentication**: JWT required
- **Response**: Customer order history

#### GET `/api/customers/:id/feedback`
- **Description**: Get customer feedback
- **Authentication**: JWT required
- **Response**: Customer feedback list

#### POST `/api/customers/export`
- **Description**: Export customer data
- **Authentication**: JWT required
- **Response**: Exported data

### Payment Management Endpoints (Legacy)

#### POST `/api/payments/create-intent`
- **Description**: Create payment intent
- **Authentication**: JWT required
- **Request Body**: Payment details

#### POST `/api/payments/confirm`
- **Description**: Confirm payment
- **Authentication**: JWT required
- **Request Body**: Payment confirmation data

#### POST `/api/payments/refund`
- **Description**: Process refund
- **Authentication**: JWT required
- **Request Body**: Refund details

#### GET `/api/payments`
- **Description**: List payments by restaurant
- **Authentication**: JWT required
- **Query Parameters**: Filtering options
- **Response**: Payment list

#### GET `/api/payments/:id`
- **Description**: Get payment by ID
- **Authentication**: JWT required
- **Response**: Payment details

### Feedback Management Endpoints (Legacy)

#### POST `/api/feedback`
- **Description**: Create feedback
- **Authentication**: JWT required
- **Request Body**: Feedback data

#### GET `/api/feedback`
- **Description**: List feedback
- **Authentication**: JWT required
- **Query Parameters**: Filtering options
- **Response**: Feedback list

#### GET `/api/feedback/:id`
- **Description**: Get feedback by ID
- **Authentication**: JWT required
- **Response**: Feedback details

#### PUT `/api/feedback/:id`
- **Description**: Update feedback
- **Authentication**: JWT required
- **Request Body**: Updated feedback data

#### DELETE `/api/feedback/:id`
- **Description**: Delete feedback
- **Authentication**: JWT required
- **Response**: Success message

#### POST `/api/feedback/:id/response`
- **Description**: Respond to feedback
- **Authentication**: JWT required
- **Request Body**: Response data

#### POST `/api/feedback/export`
- **Description**: Export feedback data
- **Authentication**: JWT required
- **Response**: Exported data

### Discount Management Endpoints (Legacy)

#### POST `/api/discounts`
- **Description**: Create new discount
- **Authentication**: JWT required
- **Request Body**: Discount data with multi-language support

#### GET `/api/discounts`
- **Description**: List discounts
- **Authentication**: JWT required
- **Query Parameters**: Filtering options
- **Response**: Discount list

#### GET `/api/discounts/:id`
- **Description**: Get discount by ID
- **Authentication**: JWT required
- **Response**: Discount details

#### PUT `/api/discounts/:id`
- **Description**: Update discount
- **Authentication**: JWT required
- **Request Body**: Updated discount data

#### DELETE `/api/discounts/:id`
- **Description**: Delete discount
- **Authentication**: JWT required
- **Response**: Success message

#### POST `/api/discounts/validate-code`
- **Description**: Validate discount code
- **Authentication**: JWT required
- **Request Body**: Discount code
- **Response**: Validation result

#### POST `/api/discounts/apply`
- **Description**: Apply discount to order
- **Authentication**: JWT required
- **Request Body**: Order and discount data
- **Response**: Applied discount details

#### GET `/api/discounts/active`
- **Description**: Get active discounts (public)
- **Authentication**: Public
- **Response**: Active discounts

#### GET `/api/discounts/stats`
- **Description**: Get discount statistics
- **Authentication**: JWT required
- **Response**: Discount usage statistics

### Super Admin Endpoints (Legacy)

#### GET `/api/admin/restaurants`
- **Description**: List all restaurants (Super Admin)
- **Authentication**: Super Admin JWT required
- **Response**: All restaurants

#### POST `/api/admin/restaurants`
- **Description**: Create restaurant (Super Admin)
- **Authentication**: Super Admin JWT required
- **Request Body**: Restaurant data

#### PUT `/api/admin/restaurants/:restaurantId`
- **Description**: Update restaurant (Super Admin)
- **Authentication**: Super Admin JWT required
- **Request Body**: Updated restaurant data

#### DELETE `/api/admin/restaurants/:restaurantId`
- **Description**: Delete restaurant (Super Admin)
- **Authentication**: Super Admin JWT required
- **Response**: Success message

#### POST `/api/admin/restaurants/:restaurantId/assign-owner`
- **Description**: Assign owner to restaurant (Super Admin)
- **Authentication**: Super Admin JWT required
- **Request Body**: Owner user ID

#### GET `/api/admin/restaurants/stats`
- **Description**: Get restaurant statistics (Super Admin)
- **Authentication**: Super Admin JWT required
- **Response**: Global restaurant statistics

---

## Newly Implemented Features

### Enhanced Security & Validation
- **Comprehensive Input Validation**: Joi schema validation for all API endpoints
- **XSS Protection**: Input sanitization to prevent cross-site scripting attacks
- **Rate Limiting**: IP-based and customer-based rate limiting for API protection
- **Enhanced Authentication**: JWT verification with role-based access control
- **Suspicious Activity Detection**: IP blocking for suspicious behavior

### Real-time Communication
- **WebSocket Notifications**: Real-time order updates for kitchen staff
- **Session Management**: Enhanced WebSocket session tracking with activity monitoring
- **Staff Authentication**: JWT-based authentication for WebSocket connections
- **Customer Order Tracking**: Real-time order status updates for customers

### Order Management Enhancements
- **Bulk Order Operations**: Mass status updates for multiple orders
- **Order Cancellation**: Enhanced cancellation with reason tracking and refund handling
- **Status Transition Validation**: Robust order status change validation
- **Kitchen Performance Tracking**: Real-time kitchen metrics and performance monitoring
- **Order Prioritization**: Priority-based order processing system

### Customer Experience Improvements
- **Public Order Tracking**: Customer order status tracking without authentication
- **Customer Order History**: Authenticated customer order history endpoint
- **Guest Order Creation**: Public order creation with rate limiting
- **Enhanced Order Validation**: Comprehensive order item and customer info validation

### Analytics & Monitoring
- **Comprehensive Logging**: Structured logging for all system activities
- **Performance Monitoring**: Real-time performance metrics tracking
- **Kitchen Analytics**: Kitchen performance and order processing analytics
- **Error Tracking**: Detailed error logging and monitoring
- **Activity Monitoring**: Staff and customer activity tracking

### Testing & Quality Assurance
- **Unit Testing**: Jest-based unit tests for all services
- **Integration Testing**: API endpoint testing with supertest
- **Code Quality**: ESLint configuration for code consistency
- **Type Safety**: Strict TypeScript configuration for type safety

---

## API Endpoints Overview

### Authentication Endpoints

#### POST `/api/auth/register`
- **Description**: Register a new user account
- **Authentication**: Public
- **Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "role": "staff"
}
```
- **Response**:
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "staff",
    "restaurantId": "507f1f77bcf86cd799439012"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/login`
- **Description**: Authenticate user and get JWT token
- **Authentication**: Public
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```
- **Response**:
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "staff",
    "restaurantId": "507f1f77bcf86cd799439012"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET `/api/auth/me`
- **Description**: Get current user profile
- **Authentication**: JWT required
- **Response**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "staff",
  "restaurantId": "507f1f77bcf86cd799439012",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Order Management Endpoints

#### POST `/api/orders`
- **Description**: Create a new order
- **Authentication**: JWT required
- **Request Body**:
```json
{
  "restaurantId": "507f1f77bcf86cd799439012",
  "storeId": "507f1f77bcf86cd799439013",
  "tableNumber": "A1",
  "customerInfo": {
    "name": "Jane Smith",
    "phone": "+1234567890",
    "email": "jane@example.com"
  },
  "items": [
    {
      "productId": "507f1f77bcf86cd799439014",
      "quantity": 2,
      "addOns": [
        {
          "name": "Extra Cheese",
          "price": 1.50,
          "quantity": 1
        }
      ],
      "notes": "Extra crispy"
    }
  ],
  "orderType": "dine_in",
  "customerNotes": "Please deliver to table"
}
```
- **Response**:
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "orderNumber": "ORD-2024-001",
  "restaurantId": "507f1f77bcf86cd799439012",
  "storeId": "507f1f77bcf86cd799439013",
  "customerInfo": {
    "name": "Jane Smith",
    "phone": "+1234567890",
    "email": "jane@example.com"
  },
  "items": [...],
  "status": "pending",
  "totals": {
    "subtotal": 25.00,
    "tax": 2.50,
    "deliveryFee": 0,
    "discount": 0,
    "tip": 0,
    "total": 27.50
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### GET `/api/orders`
- **Description**: List orders with pagination
- **Authentication**: JWT required
- **Query Parameters**:
  - `restaurantId` (optional): Filter by restaurant
  - `storeId` (optional): Filter by store
  - `status` (optional): Filter by status
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20)
- **Response**:
```json
{
  "orders": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### PUT `/api/orders/:id/status`
- **Description**: Update order status
- **Authentication**: JWT required
- **Request Body**:
```json
{
  "status": "preparing",
  "assignedTo": "507f1f77bcf86cd799439011",
  "estimatedTime": "2024-01-01T00:15:00.000Z",
  "notes": "Started preparation"
}
```
- **Response**:
```json
{
  "message": "Order status updated successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439015",
    "status": "preparing",
    "assignedTo": "507f1f77bcf86cd799439011",
    "estimatedTime": "2024-01-01T00:15:00.000Z",
    "updatedAt": "2024-01-01T00:10:00.000Z"
  }
}
```

#### PUT `/api/orders/bulk/status`
- **Description**: Bulk update multiple order statuses
- **Authentication**: JWT required
- **Request Body**:
```json
{
  "orderIds": ["507f1f77bcf86cd799439015", "507f1f77bcf86cd799439016"],
  "status": "ready",
  "assignedTo": "507f1f77bcf86cd799439011",
  "notes": "Bulk update completed"
}
```
- **Response**:
```json
{
  "message": "Bulk status update completed",
  "updatedCount": 2,
  "orders": [...]
}
```

#### GET `/api/orders/status/:orderId`
- **Description**: Get order status (public endpoint)
- **Authentication**: Public
- **Response**:
```json
{
  "orderId": "507f1f77bcf86cd799439015",
  "orderNumber": "ORD-2024-001",
  "status": "preparing",
  "estimatedTime": "2024-01-01T00:15:00.000Z",
  "items": [...],
  "totals": {
    "total": 27.50
  }
}
```

### Public Endpoints

#### GET `/api/public/menu/:restaurantId/:storeId`
- **Description**: Get restaurant menu (public)
- **Authentication**: Public
- **Response**:
```json
{
  "restaurant": {
    "name": "Sample Restaurant",
    "description": "Delicious food",
    "logo": "https://example.com/logo.png"
  },
  "categories": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "name": "Appetizers",
      "products": [...]
    }
  ]
}
```

#### GET `/api/public/restaurant/:code`
- **Description**: Get restaurant info by code
- **Authentication**: Public
- **Response**:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Sample Restaurant",
  "description": "Delicious food",
  "restaurantCode": "REST001",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA"
  },
  "contact": {
    "phone": "+1234567890",
    "email": "info@restaurant.com"
  }
}
```

#### POST `/api/public/orders`
- **Description**: Create guest order (public)
- **Authentication**: Public
- **Request Body**: Same as authenticated order creation
- **Response**: Same as authenticated order creation

### Kitchen Management Endpoints

#### GET `/api/orders/kitchen/pending`
- **Description**: Get pending orders for kitchen
- **Authentication**: JWT required
- **Response**:
```json
{
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "orderNumber": "ORD-2024-001",
      "status": "pending",
      "items": [...],
      "customerInfo": {...},
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET `/api/orders/kitchen/stats`
- **Description**: Get kitchen performance statistics
- **Authentication**: JWT required
- **Response**:
```json
{
  "pendingOrders": 5,
  "preparingOrders": 3,
  "readyOrders": 2,
  "averagePrepTime": 15.5,
  "completionRate": 0.95,
  "todayOrders": 25
}
```

### Restaurant Management Endpoints

#### GET `/api/restaurants`
- **Description**: List restaurants
- **Authentication**: JWT required
- **Response**:
```json
{
  "restaurants": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Sample Restaurant",
      "restaurantCode": "REST001",
      "isActive": true,
      "rating": 4.5,
      "totalOrders": 1500
    }
  ]
}
```

#### POST `/api/restaurants`
- **Description**: Create new restaurant
- **Authentication**: JWT required
- **Request Body**:
```json
{
  "name": "New Restaurant",
  "description": "Amazing food",
  "cuisine": "Italian",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  },
  "contact": {
    "phone": "+1234567890",
    "email": "info@restaurant.com"
  }
}
```

### Product Management Endpoints

#### GET `/api/products`
- **Description**: List products
- **Authentication**: JWT required
- **Query Parameters**:
  - `categoryId` (optional): Filter by category
  - `restaurantId` (optional): Filter by restaurant
  - `isAvailable` (optional): Filter by availability
- **Response**:
```json
{
  "products": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Margherita Pizza",
      "description": "Classic tomato and mozzarella",
      "price": 12.99,
      "categoryId": "507f1f77bcf86cd799439017",
      "isAvailable": true,
      "preparationTime": 15
    }
  ]
}
```

#### POST `/api/products`
- **Description**: Create new product
- **Authentication**: JWT required
- **Request Body**:
```json
{
  "name": "New Product",
  "description": "Delicious new item",
  "price": 9.99,
  "categoryId": "507f1f77bcf86cd799439017",
  "isAvailable": true,
  "preparationTime": 10,
  "addOns": [
    {
      "name": "Extra Cheese",
      "price": 1.50
    }
  ]
}
```

### Health Check Endpoint

#### GET `/api/health`
- **Description**: System health check
- **Authentication**: Public
- **Response**:
```json
{
  "status": "ok",
  "db": "connected"
}
```

---

## Data Schemas

### Order Schema
```typescript
interface IOrder {
  orderNumber: string;                    // Auto-generated unique order number
  restaurantId: ObjectId;                 // Reference to Restaurant
  storeId: ObjectId;                      // Reference to Store
  customerId?: ObjectId;                  // Reference to Customer (optional)
  customerInfo: {
    name: string;                         // Customer name
    phone: string;                        // Customer phone
    email?: string;                       // Customer email (optional)
  };
  items: IOrderItem[];                    // Array of order items
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  tableNumber?: string;                   // Table number for dine-in
  deliveryAddress?: IDeliveryAddress;     // Delivery address for delivery orders
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'delivered';
  payment: IPayment;                      // Payment information
  totals: ITotals;                        // Order totals
  discount?: IDiscount;                   // Applied discount (optional)
  estimatedTime?: Date;                   // Estimated completion time
  actualTime?: Date;                      // Actual completion time
  assignedTo?: ObjectId;                  // Staff member assigned
  notes?: string;                         // Internal notes
  customerNotes?: string;                 // Customer notes
  internalNotes?: string;                 // Internal staff notes
  createdAt: Date;
  updatedAt: Date;
}
```

### Restaurant Schema
```typescript
interface IRestaurant {
  name: string;                           // Restaurant name
  description: string;                    // Restaurant description
  logo: string;                          // Logo URL
  banner: string;                        // Banner URL
  cuisine: string;                       // Cuisine type
  restaurantCode: string;                // Unique restaurant code
  address: IAddress;                     // Restaurant address
  contact: IContact;                     // Contact information
  social: ISocial;                       // Social media links
  settings: ISettings;                   // Restaurant settings
  ownerId: ObjectId;                     // Restaurant owner
  isActive: boolean;                     // Active status
  isVerified: boolean;                   // Verification status
  subscription: ISubscription;           // Subscription details
  rating: number;                        // Average rating
  totalReviews: number;                  // Total review count
  totalOrders: number;                   // Total order count
  monthlyRevenue: number;                // Monthly revenue
  createdAt: Date;
  updatedAt: Date;
}
```

### Product Schema
```typescript
interface IProduct {
  name: string;                          // Product name
  nameAr?: string;                       // Arabic name (optional)
  nameDe?: string;                       // German name (optional)
  description: string;                   // Product description
  price: number;                         // Base price
  categoryId: ObjectId;                  // Reference to Category
  restaurantId: ObjectId;                // Reference to Restaurant
  storeId: ObjectId;                     // Reference to Store
  isAvailable: boolean;                  // Availability status
  preparationTime: number;               // Preparation time in minutes
  addOns: IAddOn[];                      // Available add-ons
  allergens: string[];                   // Allergen information
  nutritionalInfo: INutritionalInfo;     // Nutritional information
  images: string[];                      // Product images
  createdAt: Date;
  updatedAt: Date;
}
```

### User Schema
```typescript
interface IUser {
  firstName: string;                     // First name
  lastName: string;                      // Last name
  email: string;                         // Email address
  password: string;                      // Hashed password
  phone: string;                         // Phone number
  role: 'super_admin' | 'restaurant_owner' | 'staff' | 'customer';
  restaurantId?: ObjectId;               // Associated restaurant
  storeId?: ObjectId;                    // Associated store
  isActive: boolean;                     // Active status
  lastLogin?: Date;                      // Last login time
  createdAt: Date;
  updatedAt: Date;
}
```

### Customer Schema
```typescript
interface ICustomer {
  name: string;                          // Customer name
  email: string;                         // Email address
  phone: string;                         // Phone number
  restaurantId: ObjectId;                // Associated restaurant
  loyaltyPoints: number;                 // Loyalty points balance
  totalOrders: number;                   // Total order count
  totalSpent: number;                    // Total amount spent
  preferences: ICustomerPreferences;     // Customer preferences
  isActive: boolean;                     // Active status
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Frontend Expected Data Flow

### Authentication Flow
1. **Login Process**:
   - Frontend sends email/password to `/api/auth/login`
   - Backend validates credentials and returns JWT token
   - Frontend stores token in localStorage/sessionStorage
   - Frontend includes token in Authorization header for subsequent requests

2. **Registration Process**:
   - Frontend sends user data to `/api/auth/register`
   - Backend creates user account and returns JWT token
   - Frontend automatically logs in the user

3. **Token Management**:
   - Frontend includes `Authorization: Bearer <token>` header in all authenticated requests
   - Frontend handles token expiration (401 responses)
   - Frontend implements logout by removing stored token

### Order Management Flow
1. **Order Creation**:
   - Frontend collects order data (items, customer info, delivery details)
   - Frontend validates data using client-side validation
   - Frontend sends POST request to `/api/orders`
   - Frontend receives order confirmation with order number
   - Frontend displays order confirmation to customer

2. **Order Tracking**:
   - Frontend provides order number to customer
   - Customer can track order using `/api/orders/status/:orderId` (public)
   - Frontend polls status endpoint for real-time updates
   - Frontend displays order status and estimated completion time

3. **Kitchen Interface**:
   - Staff logs in and accesses kitchen dashboard
   - Frontend fetches pending orders from `/api/orders/kitchen/pending`
   - Frontend displays orders in priority queue
   - Staff can update order status using `/api/orders/:id/status`
   - Frontend receives real-time updates via WebSocket

### Menu Management Flow
1. **Menu Display**:
   - Frontend fetches menu from `/api/public/menu/:restaurantId/:storeId`
   - Frontend displays categories and products
   - Frontend handles product selection and add-ons
   - Frontend calculates totals based on selections

2. **Product Management**:
   - Staff can manage products via `/api/products`
   - Frontend provides CRUD interface for products
   - Frontend handles image uploads and form validation
   - Frontend displays product availability and pricing

### Restaurant Management Flow
1. **Restaurant Setup**:
   - Owner registers restaurant via `/api/restaurants`
   - Frontend collects restaurant details and settings
   - Frontend handles logo and banner uploads
   - Frontend configures restaurant-specific settings

2. **Multi-location Management**:
   - Owner can manage multiple stores
   - Frontend displays store list and individual store settings
   - Frontend handles store-specific configurations

### Real-time Updates Flow
1. **WebSocket Connection**:
   - Frontend establishes WebSocket connection to server
   - Frontend authenticates using JWT token
   - Frontend joins restaurant-specific room

2. **Real-time Notifications**:
   - Frontend receives order notifications in real-time
   - Frontend updates order status without page refresh
   - Frontend displays notifications to staff
   - Frontend handles connection errors and reconnection

### Payment Flow
1. **Payment Processing**:
   - Frontend integrates with Stripe for payment processing
   - Frontend collects payment method from customer
   - Frontend sends payment data to backend
   - Frontend handles payment confirmation and error states

2. **Payment Status Tracking**:
   - Frontend tracks payment status in real-time
   - Frontend displays payment confirmation to customer
   - Frontend handles payment failures and retries

### Customer Experience Flow
1. **QR Code Scanning**:
   - Customer scans table QR code
   - Frontend validates QR code via `/api/public/qr/validate/:qrCode`
   - Frontend loads restaurant menu and table information
   - Frontend pre-fills table number in order form

2. **Guest Ordering**:
   - Customer can place orders without registration
   - Frontend collects minimal customer information
   - Frontend uses public order endpoints
   - Frontend provides order tracking via order number

### Analytics and Reporting Flow
1. **Performance Monitoring**:
   - Frontend displays real-time kitchen metrics
   - Frontend shows order processing statistics
   - Frontend tracks customer satisfaction metrics
   - Frontend provides staff performance analytics

2. **Reporting Dashboard**:
   - Frontend fetches analytics data from backend
   - Frontend displays charts and graphs
   - Frontend provides export functionality
   - Frontend handles date range filtering

### Error Handling Flow
1. **Validation Errors**:
   - Frontend displays field-specific error messages
   - Frontend highlights invalid form fields
   - Frontend prevents form submission until valid
   - Frontend provides helpful error descriptions

2. **Network Errors**:
   - Frontend handles connection timeouts
   - Frontend implements retry logic for failed requests
   - Frontend displays user-friendly error messages
   - Frontend provides offline functionality where possible

3. **Authentication Errors**:
   - Frontend redirects to login on 401 responses
   - Frontend clears stored tokens on authentication failures
   - Frontend displays session expiration messages
   - Frontend provides seamless re-authentication flow
