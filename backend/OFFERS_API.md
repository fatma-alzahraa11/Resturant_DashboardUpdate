# Offers API Documentation

## Overview
The Offers API provides comprehensive management of promotional offers for restaurants. Each offer can contain multiple products with specific quantities and units.

## Base URL
```
/api/offers
```

## Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Offer
**POST** `/api/offers`

Creates a new promotional offer.

**Request Body:**
```json
{
  "title": "Special Combo Deal",
  "description": "Get our best dishes at a special price",
  "image": "data:image/jpeg;base64,/9j/4AAQ...", // Base64 image or URL
  "price": 25.99,
  "originalPrice": 35.99, // Optional
  "currency": "EUR", // Optional, defaults to EUR
  "products": [
    {
      "productId": "60d5ecb54b24a10015c4d1a1",
      "quantity": 2,
      "unit": "Number"
    },
    {
      "productId": "60d5ecb54b24a10015c4d1a2",
      "quantity": 1,
      "unit": "KG"
    }
  ],
  "isAvailable": true, // Optional, defaults to true
  "validFrom": "2024-01-01T00:00:00.000Z", // Optional
  "validUntil": "2024-12-31T23:59:59.999Z", // Optional
  "maxRedemptions": 100, // Optional
  "tags": ["combo", "special", "popular"], // Optional
  "storeId": "60d5ecb54b24a10015c4d1a3" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ecb54b24a10015c4d1a4",
    "title": "Special Combo Deal",
    "description": "Get our best dishes at a special price",
    "image": "data:image/jpeg;base64,/9j/4AAQ...",
    "price": 25.99,
    "originalPrice": 35.99,
    "currency": "EUR",
    "products": [
      {
        "productId": {
          "_id": "60d5ecb54b24a10015c4d1a1",
          "name": "Burger",
          "price": 15.99
        },
        "quantity": 2,
        "unit": "Number"
      }
    ],
    "isAvailable": true,
    "validFrom": "2024-01-01T00:00:00.000Z",
    "validUntil": "2024-12-31T23:59:59.999Z",
    "maxRedemptions": 100,
    "currentRedemptions": 0,
    "tags": ["combo", "special", "popular"],
    "sortOrder": 1704067200000,
    "createdBy": "60d5ecb54b24a10015c4d1a5",
    "restaurantId": "60d5ecb54b24a10015c4d1a6",
    "storeId": "60d5ecb54b24a10015c4d1a3",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "discountPercentage": 28,
    "savingsAmount": 10,
    "isValid": true
  },
  "message": "Offer created successfully"
}
```

### 2. Get All Offers
**GET** `/api/offers`

Retrieves all offers with filtering, searching, and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `search` (string): Search in title, description, and tags
- `isAvailable` (boolean): Filter by availability
- `sortBy` (string): Sort field (title, price, createdAt, updatedAt, currentRedemptions)
- `sortOrder` (string): Sort direction (asc, desc)
- `storeId` (string): Filter by store ID

**Example:**
```
GET /api/offers?page=1&limit=10&search=combo&isAvailable=true&sortBy=createdAt&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ecb54b24a10015c4d1a4",
      "title": "Special Combo Deal",
      // ... other offer fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "statistics": {
    "total": 25,
    "available": 20,
    "totalValue": 649.75,
    "averagePrice": 25.99,
    "totalRedemptions": 150
  }
}
```

### 3. Get Single Offer
**GET** `/api/offers/:id`

Retrieves a specific offer by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ecb54b24a10015c4d1a4",
    "title": "Special Combo Deal",
    // ... complete offer details with populated products
  }
}
```

### 4. Update Offer
**PUT** `/api/offers/:id`

Updates an existing offer. All fields are optional.

**Request Body:** (Same as create, but all fields optional)

**Response:**
```json
{
  "success": true,
  "data": {
    // ... updated offer data
  },
  "message": "Offer updated successfully"
}
```

### 5. Delete Offer
**DELETE** `/api/offers/:id`

Deletes an offer permanently.

**Response:**
```json
{
  "success": true,
  "message": "Offer deleted successfully"
}
```

### 6. Toggle Availability
**PATCH** `/api/offers/:id/toggle-availability`

Toggles the availability status of an offer.

**Response:**
```json
{
  "success": true,
  "data": {
    "isAvailable": false
  },
  "message": "Offer disabled successfully"
}
```

### 7. Get Statistics
**GET** `/api/offers/statistics`

Returns comprehensive statistics about offers.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOffers": 25,
    "availableOffers": 20,
    "totalValue": 649.75,
    "averagePrice": 25.99,
    "totalRedemptions": 150,
    "totalSavings": 250.00
  }
}
```

## Public Endpoints (No Authentication Required)

### 8. Get Active Offers for Restaurant
**GET** `/api/offers/public/restaurant/:restaurantId`

**GET** `/api/offers/public/restaurant/:restaurantId/store/:storeId`

Returns all currently active offers for a restaurant or specific store.

### 9. Redeem Offer
**POST** `/api/offers/public/:id/redeem`

Redeems an offer (increments redemption counter).

**Request Body:**
```json
{
  "customerId": "60d5ecb54b24a10015c4d1a7" // Optional
}
```

## Data Models

### Offer Product
```typescript
interface IOfferProduct {
  productId: ObjectId; // References Product model
  quantity: number;    // Must be >= 1
  unit: string;       // "Number" | "KG" | "None"
}
```

### Offer
```typescript
interface IOffer {
  restaurantId: ObjectId;        // Required
  storeId?: ObjectId;           // Optional
  title: string;                // Required, max 100 chars
  description?: string;         // Optional, max 500 chars
  image?: string;              // Optional, base64 or URL
  price: number;               // Required, >= 0
  originalPrice?: number;      // Optional, >= price
  currency: string;            // Default: "EUR"
  products: IOfferProduct[];   // Required, min 1 product
  isAvailable: boolean;        // Default: true
  validFrom?: Date;           // Optional
  validUntil?: Date;          // Optional, must be > validFrom
  maxRedemptions?: number;    // Optional, >= 0
  currentRedemptions: number; // Default: 0
  tags: string[];            // Optional, max 50 chars each
  sortOrder: number;         // Auto-generated
  createdBy: ObjectId;       // Auto-set to current user
  updatedBy?: ObjectId;      // Auto-set on updates
  createdAt: Date;          // Auto-generated
  updatedAt: Date;          // Auto-updated
  
  // Virtual fields (calculated)
  discountPercentage: number; // If originalPrice exists
  savingsAmount: number;      // originalPrice - price
  isValid: boolean;          // Checks all validity conditions
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created successfully
- `400` - Bad request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Internal server error

## Validation Rules

### Required Fields for Creation
- `title` (1-100 characters)
- `price` (positive number)
- `products` (array with at least 1 item)
- Each product must have: `productId`, `quantity` (≥1), `unit`

### Optional Fields
- `description` (max 500 characters)
- `image` (string)
- `originalPrice` (must be ≥ price if provided)
- `currency` (EUR, USD, GBP, SAR, AED)
- `isAvailable` (boolean)
- `validFrom` (ISO date string)
- `validUntil` (ISO date string, must be > validFrom)
- `maxRedemptions` (positive integer)
- `tags` (array of strings, max 50 chars each)
- `storeId` (valid ObjectId)

### Business Rules
- Products must belong to the same restaurant
- Users can only manage offers for their restaurant/store
- Store-specific users can only see/manage offers for their store
- Offers cannot be redeemed if:
  - `isAvailable` is false
  - Current date is before `validFrom`
  - Current date is after `validUntil`
  - `currentRedemptions` >= `maxRedemptions`

## Frontend Integration

This API is designed to work seamlessly with the provided React frontend. The frontend expects:

1. **Statistics endpoint** for dashboard cards
2. **List endpoint** with search and filtering
3. **CRUD operations** for offer management
4. **Toggle availability** for quick status changes
5. **Proper error handling** with descriptive messages

Make sure to handle loading states, error states, and success messages in your frontend components.

