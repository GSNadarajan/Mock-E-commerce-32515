# Mock E-commerce API

A comprehensive RESTful API for e-commerce applications, providing user management, product management, and order management functionality. This project serves as a foundation for building e-commerce platforms with features like authentication, product catalog, shopping cart, and order processing.

## Overview

This Mock E-commerce API is built with a modular architecture consisting of three main components:

1. **User Management**: Handles user registration, authentication, and profile management
2. **Product Management**: Manages product catalog, categories, and inventory
3. **Order Management**: Processes orders, shopping carts, and order status tracking

Each component is designed to work together while maintaining separation of concerns, making the system scalable and maintainable.

## Features

### User Management
- User registration and authentication with JWT
- Role-based access control (User/Admin roles)
- Email verification and password reset
- User profile management
- Secure password hashing with bcrypt

### Product Management
- Complete product CRUD operations
- Product categorization and search
- Product inventory management
- Image URL support for product listings
- Admin-only product creation and modification

### Order Management
- Shopping cart functionality
- Order creation and processing
- Order status tracking and updates
- Order history for users
- Admin order management dashboard

### General Features
- RESTful API design
- Interactive Swagger documentation
- Input validation using express-validator
- JSON file-based data storage for development
- In-memory caching for improved performance
- Comprehensive error handling
- Logging with Winston

## Technologies Used

### Core Technologies
- **Node.js** (v16+): JavaScript runtime environment
- **Express.js** (v4.18+): Web application framework
- **JSON Web Tokens (JWT)**: Secure authentication
- **Bcrypt**: Password hashing
- **Express Validator** (v7.0+): Input validation

### Storage and Caching
- **FS-Extra** (v11.0+): Enhanced file operations for JSON storage
- **Node-Cache** (v5.0+): In-memory caching

### Documentation and Logging
- **Swagger UI**: Interactive API documentation
- **Winston** (v3.0+): Logging

### Development Tools
- **Nodemon**: Development server with auto-reload
- **ESLint**: Code quality and style checking
- **Jest**: Unit and integration testing
- **Postman**: API testing

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Mock-E-commerce-32515
   ```

2. Install dependencies for the main application:
   ```bash
   npm install
   ```

3. Install dependencies for the order management service:
   ```bash
   cd order-management
   npm install
   cd ..
   ```

4. Create a `.env` file in the root directory (optional):
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=1d

   # Email Configuration (if needed)
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=user@example.com
   SMTP_PASS=password
   SMTP_SECURE=false
   EMAIL_FROM="E-commerce API <noreply@example.com>"
   ```

5. Create a `.env` file in the order-management directory (optional):
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # User Service Configuration
   USER_SERVICE_URL=http://localhost:3000
   ```

### Starting the Application

1. Start the main application (User and Product Management):
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

2. Start the Order Management service (in a separate terminal):
   ```bash
   cd order-management
   
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

3. Access the services:
   - Main API: http://localhost:3000
   - Main API Swagger Documentation: http://localhost:3000/api-docs
   - Order Management API: http://localhost:3001
   - Order Management Swagger Documentation: http://localhost:3001/api-docs

## API Documentation

The API is documented using Swagger. Once the servers are running, you can access the interactive documentation at:

- Main API (User and Product Management): http://localhost:3000/api-docs
- Order Management API: http://localhost:3001/api-docs

### API Endpoints

#### User Management

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/search?query=<search_term>` - Search users by username or email
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update user by ID
- `DELETE /api/users/:id` - Delete user by ID

#### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/verify-email` - Verify user email
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout user

#### Product Management

- `GET /api/products` - Get all products
- `GET /api/products/search?query=<search_term>` - Search products by name or description
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product (admin only)
- `PUT /api/products/:id` - Update product by ID (admin only)
- `DELETE /api/products/:id` - Delete product by ID (admin only)

#### Shopping Cart

- `GET /api/carts/:userId` - Get a user's cart
- `POST /api/carts/:userId/items` - Add an item to the cart
- `DELETE /api/carts/:userId/items/:productId` - Remove an item from the cart
- `DELETE /api/carts/:userId` - Clear a user's cart
- `PATCH /api/carts/:userId/items/:productId/quantity` - Update item quantity in cart
- `GET /api/carts/:userId/total` - Calculate cart total

#### Order Management

- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders/search` - Search orders by criteria (admin only)
- `GET /api/orders/status/:status` - Get orders by status (admin only)
- `GET /api/orders/counts` - Get order counts by status (admin only)
- `GET /api/orders/user/:userId` - Get orders by user ID
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id` - Update an order
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete an order (admin only)

## Authentication and Authorization

### Authentication Flow

1. **Registration**: User registers with email, username, and password
   ```
   POST /api/auth/register
   ```

2. **Email Verification** (optional): User verifies email via a link sent to their email
   ```
   GET /api/auth/verify-email?token=<verification_token>
   ```

3. **Login**: User logs in with email and password to receive JWT token
   ```
   POST /api/auth/login
   ```

4. **Token Usage**: Include the JWT token in the Authorization header for protected routes
   ```
   Authorization: Bearer <jwt_token>
   ```

5. **Token Refresh**: Use the refresh token to obtain a new JWT token when expired
   ```
   POST /api/auth/refresh-token
   ```

### Authorization

The API supports two user roles:

- **User**: Regular user with access to their own data
- **Admin**: Administrator with access to all data and administrative functions

Middleware functions `isAuthenticated` and `isAdmin` are used to protect routes based on authentication status and user role.

## Data Models

### User Model

```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "password": "string (hashed)",
  "role": "string (user/admin)",
  "isVerified": "boolean",
  "verificationToken": "string or null",
  "resetToken": "string or null",
  "resetTokenExpiry": "string (ISO date) or null",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)",
  "lastLogin": "string (ISO date) or null"
}
```

### Product Model

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": "number",
  "category": "string",
  "imageUrl": "string",
  "stock": "integer",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

### Cart Model

```json
{
  "id": "string",
  "userId": "string",
  "items": [
    {
      "productId": "string",
      "name": "string",
      "price": "number",
      "quantity": "integer"
    }
  ],
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

### Order Model

```json
{
  "id": "string",
  "userId": "string",
  "items": [
    {
      "productId": "string",
      "name": "string",
      "price": "number",
      "quantity": "integer"
    }
  ],
  "shippingAddress": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "billingAddress": "object (same structure as shippingAddress)",
  "status": "string (pending/processing/shipped/delivered/cancelled)",
  "totalAmount": "number",
  "paymentMethod": "string",
  "paymentStatus": "string (pending/paid/failed/refunded)",
  "notes": "string",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)",
  "statusHistory": [
    {
      "status": "string",
      "timestamp": "string (ISO date)",
      "note": "string"
    }
  ]
}
```

## Usage Examples

### Authentication

#### Register a new user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a1b2c3d4",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "role": "user"
  }
}
```

### Product Management

#### Get all products

```bash
curl -X GET http://localhost:3000/api/products
```

#### Search products

```bash
curl -X GET "http://localhost:3000/api/products/search?query=headphones"
```

#### Create a product (admin only)

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": "Wireless Headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "price": 99.99,
    "category": "electronics",
    "imageUrl": "https://example.com/headphones.jpg",
    "stock": 50
  }'
```

### Shopping Cart

#### Add item to cart

```bash
curl -X POST http://localhost:3001/api/carts/a1b2c3d4/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user_token>" \
  -d '{
    "productId": "p1",
    "name": "Wireless Headphones",
    "price": 99.99,
    "quantity": 1
  }'
```

#### Get cart

```bash
curl -X GET http://localhost:3001/api/carts/a1b2c3d4 \
  -H "Authorization: Bearer <user_token>"
```

### Order Management

#### Create an order

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user_token>" \
  -d '{
    "userId": "a1b2c3d4",
    "items": [
      {
        "productId": "p1",
        "name": "Wireless Headphones",
        "price": 99.99,
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345",
      "country": "USA"
    },
    "paymentMethod": "credit_card"
  }'
```

#### Get user orders

```bash
curl -X GET http://localhost:3001/api/orders/user/a1b2c3d4 \
  -H "Authorization: Bearer <user_token>"
```

## Project Structure

```
├── order-management/           # Order Management Service
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Request handlers
│   │   ├── data/              # JSON data storage
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # Data models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic services
│   │   ├── utils/             # Helper functions
│   │   ├── app.js             # Express application setup
│   │   └── server.js          # Server entry point
│   ├── tests/                 # Test files
│   └── package.json           # Dependencies and scripts
│
├── src/                       # Main Application (User and Product Management)
│   ├── config/                # Configuration files
│   │   ├── auth.js            # Authentication configuration
│   │   ├── email.js           # Email configuration
│   │   └── swagger.js         # Swagger configuration
│   ├── controllers/           # Request handlers
│   ├── data/                  # JSON data storage
│   ├── middleware/            # Express middleware
│   ├── models/                # Data models
│   ├── orders/                # Order management component
│   ├── products/              # Product management component
│   │   ├── controllers/       # Product controllers
│   │   ├── models/            # Product models
│   │   └── routes/            # Product routes
│   ├── routes/                # API routes
│   ├── services/              # Business logic services
│   ├── tests/                 # Test files
│   ├── app.js                 # Express application setup
│   └── server.js              # Server entry point
│
├── utils/                     # Shared utility functions
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

## Development and Testing

### Running in Development Mode

```bash
# Main application
npm run dev

# Order management service (in a separate terminal)
cd order-management
npm run dev
```

### Testing

```bash
# Run tests for main application
npm test

# Run tests for order management service
cd order-management
npm test
```

## Error Handling

The API uses standard HTTP status codes for error responses:

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `204 No Content`: Resource deleted successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses follow this format:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens are used for stateless authentication
- Input validation is performed using express-validator
- Role-based access control for protected resources
- CORS is enabled for cross-origin requests

## Future Enhancements

- Add database integration (MongoDB, PostgreSQL, etc.)
- Implement rate limiting for API endpoints
- Add OAuth 2.0 for third-party authentication
- Implement two-factor authentication
- Add payment gateway integration
- Implement real-time notifications
- Add product reviews and ratings
- Implement inventory management

## License

This project is licensed under the MIT License.

## Disclaimer

This is a mock implementation intended for demonstration and development purposes only. It is not suitable for production use without additional security measures and proper database integration.
