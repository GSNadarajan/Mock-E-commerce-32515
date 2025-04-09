# E-commerce API

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [User Management](#user-management)
  - [Product Management](#product-management)
  - [Order Management](#order-management)
  - [Cart Management](#cart-management)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Error Handling](#error-handling)
- [Security Considerations](#security-considerations)
- [Project Structure](#project-structure)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)
- [Disclaimer](#disclaimer)

## Introduction

The E-commerce API is a comprehensive RESTful service designed for building e-commerce applications. It provides a robust backend solution with user management, product management, and order management components, all designed for scalability and maintainability.

This API serves as a foundation for developing e-commerce platforms, allowing developers to focus on building great user experiences while leveraging a reliable backend infrastructure.

## Features

### Core Features

- **RESTful API Design**: Well-structured endpoints following REST principles
- **Interactive Documentation**: Swagger UI for exploring and testing API endpoints
- **Input Validation**: Comprehensive request validation using express-validator
- **Error Handling**: Consistent error responses with appropriate HTTP status codes
- **Logging**: Detailed logging with Winston for debugging and monitoring
- **Caching**: In-memory caching with Node-Cache for improved performance

### Component-Specific Features

#### User Management
- User registration and authentication (JWT)
- Profile management
- Role-based access control (User/Admin)
- Email verification
- Password reset functionality
- Secure password hashing with bcrypt

#### Product Management
- Product CRUD operations
- Product categorization
- Inventory management
- Product search and filtering
- Support for product images via URLs
- Admin-only product creation and modification

#### Order Management
- Shopping cart functionality
- Order processing
- Order status tracking
- Order history
- Admin dashboard for order management

## System Architecture

The E-commerce API is built using a modular architecture with the following main components:

1. **Main Application** (`src/`)
   - User Management
   - Product Management
   - Core API functionality

2. **Order Management Service** (`order-management/`)
   - Order processing
   - Cart management
   - Integrates with the main application

3. **Shared Utilities** (`utils/`)
   - Common functions and helpers used across the application

The API follows a layered architecture pattern:

- **Routes Layer**: Defines API endpoints and routes requests to controllers
- **Controller Layer**: Handles request processing and response generation
- **Service Layer**: Contains business logic
- **Model Layer**: Represents data structures and handles data access

## Prerequisites

Before installing the E-commerce API, ensure you have the following prerequisites:

- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **Git** (for cloning the repository)

## Installation

Follow these steps to install and set up the E-commerce API:

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/e-commerce-api.git
cd e-commerce-api
```

2. **Install dependencies for the main application**

```bash
npm install
```

3. **Install dependencies for the order management service**

```bash
cd order-management
npm install
cd ..
```

4. **Create environment variables (optional)**

Create a `.env` file in the root directory and in the `order-management` directory with the following variables:

```
PORT=3000
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h
REFRESH_TOKEN_EXPIRATION=7d
EMAIL_SERVICE=smtp.example.com
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
FRONTEND_URL=http://localhost:8080
```

For the order management service, use:

```
PORT=3001
JWT_SECRET=your_jwt_secret_key
```

5. **Start the application**

Start the main application:

```bash
npm start
```

In a separate terminal, start the order management service:

```bash
cd order-management
npm start
```

The main API will be available at `http://localhost:3000` and the order management service at `http://localhost:3001`.

Swagger documentation will be available at `http://localhost:3000/api-docs`.

## Configuration

The E-commerce API can be configured using environment variables. Here are the key configuration options:

### Main Application

| Variable | Description | Default |
|----------|-------------|--------|
| `PORT` | The port on which the server runs | `3000` |
| `JWT_SECRET` | Secret key for JWT token generation | `your_jwt_secret_key` |
| `JWT_EXPIRATION` | JWT token expiration time | `24h` |
| `REFRESH_TOKEN_EXPIRATION` | Refresh token expiration time | `7d` |
| `EMAIL_SERVICE` | SMTP service for sending emails | `smtp.example.com` |
| `EMAIL_USER` | Email address for sending emails | `your_email@example.com` |
| `EMAIL_PASSWORD` | Password for the email account | `your_email_password` |
| `FRONTEND_URL` | URL of the frontend application | `http://localhost:8080` |

### Order Management Service

| Variable | Description | Default |
|----------|-------------|--------|
| `PORT` | The port on which the service runs | `3001` |
| `JWT_SECRET` | Secret key for JWT verification (should match main app) | `your_jwt_secret_key` |

## API Documentation

The E-commerce API provides a comprehensive set of endpoints for managing users, products, orders, and shopping carts. The API is documented using Swagger, which provides an interactive interface for exploring and testing the endpoints.

Access the Swagger documentation at: `http://localhost:3000/api-docs`

### Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints, you need to include the JWT token in the Authorization header of your requests.

#### Authentication Endpoints

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| `POST` | `/api/auth/register` | Register a new user | No |
| `GET` | `/api/auth/verify-email` | Verify user email | No |
| `POST` | `/api/auth/login` | Login user | No |
| `POST` | `/api/auth/logout` | Logout user | Yes |
| `POST` | `/api/auth/request-password-reset` | Request password reset | No |
| `POST` | `/api/auth/reset-password` | Reset password | No |
| `POST` | `/api/auth/refresh-token` | Refresh JWT token | No |
| `GET` | `/api/auth/profile` | Get current user profile | Yes |
| `PUT` | `/api/auth/profile` | Update current user profile | Yes |
| `POST` | `/api/auth/verify-token` | Verify JWT token | Yes |

#### Authentication Flow

1. **Registration**: Create a new user account using `/api/auth/register`
2. **Email Verification**: Verify your email using the link sent to your email
3. **Login**: Authenticate using `/api/auth/login` to receive a JWT token
4. **Using the Token**: Include the token in the Authorization header for protected endpoints
5. **Token Refresh**: Use `/api/auth/refresh-token` to get a new token when the current one expires

### User Management

The User Management API provides endpoints for managing user accounts and profiles.

#### User Management Endpoints

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| `GET` | `/api/users` | Get all users | No |
| `GET` | `/api/users/search` | Search users by username or email | No |
| `GET` | `/api/users/:id` | Get user by ID | No |
| `POST` | `/api/users` | Create a new user | No |
| `PUT` | `/api/users/:id` | Update user by ID | No |
| `DELETE` | `/api/users/:id` | Delete user by ID | No |

### Product Management

The Product Management API provides endpoints for managing products in the e-commerce system.

#### Product Management Endpoints

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| `GET` | `/api/products` | Get all products | No |
| `GET` | `/api/products/search` | Search products by name or description | No |
| `GET` | `/api/products/category/:category` | Get products by category | No |
| `GET` | `/api/products/:id` | Get product by ID | No |
| `POST` | `/api/products` | Create a new product | Yes (Admin) |
| `PUT` | `/api/products/:id` | Update product by ID | Yes (Admin) |
| `DELETE` | `/api/products/:id` | Delete product by ID | Yes (Admin) |

### Order Management

The Order Management API provides endpoints for managing orders in the e-commerce system.

#### Order Management Endpoints

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| `GET` | `/api/orders` | Get all orders | Yes (Admin) |
| `GET` | `/api/orders/search` | Search orders by criteria | Yes (Admin) |
| `GET` | `/api/orders/status/:status` | Get orders by status | Yes (Admin) |
| `GET` | `/api/orders/counts` | Get order counts by status | Yes (Admin) |
| `GET` | `/api/orders/user/:userId` | Get orders by user ID | Yes |
| `GET` | `/api/orders/:id` | Get order by ID | Yes |
| `POST` | `/api/orders` | Create a new order | Yes |
| `PUT` | `/api/orders/:id` | Update an order | Yes |
| `PATCH` | `/api/orders/:id/status` | Update order status | Yes |
| `DELETE` | `/api/orders/:id` | Delete an order | Yes (Admin) |

### Cart Management

The Cart Management API provides endpoints for managing shopping carts in the e-commerce system.

#### Cart Management Endpoints

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| `GET` | `/api/carts/:userId` | Get a user's cart | Yes |
| `POST` | `/api/carts/:userId/items` | Add an item to the cart | Yes |
| `DELETE` | `/api/carts/:userId/items/:productId` | Remove an item from the cart | Yes |
| `DELETE` | `/api/carts/:userId` | Clear a user's cart | Yes |
| `PATCH` | `/api/carts/:userId/items/:productId/quantity` | Update item quantity in cart | Yes |
| `GET` | `/api/carts/:userId/total` | Calculate cart total | Yes |
| `DELETE` | `/api/carts/:userId/delete` | Delete a user's cart completely | Yes |

## Usage Examples

Here are some examples of how to use the E-commerce API:

### Authentication Example: Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

### Authentication Example: Login

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
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "role": "user"
  }
}
```

### Product Management Example: Create Product (Admin Only)

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "price": 99.99,
    "category": "electronics",
    "imageUrl": "https://example.com/headphones.jpg",
    "stock": 50
  }'
```

### Product Management Example: Get All Products

```bash
curl -X GET http://localhost:3000/api/products
```

### Order Management Example: Create Order

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id",
    "items": [
      {
        "productId": "product_id",
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

### Cart Management Example: Add Item to Cart

```bash
curl -X POST http://localhost:3000/api/carts/user_id/items \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product_id",
    "name": "Wireless Headphones",
    "price": 99.99,
    "quantity": 1
  }'
```

## Testing

The E-commerce API includes a comprehensive test suite to ensure functionality and reliability. Tests are written using Jest and Supertest.

### Running Tests

To run the tests, use the following command:

```bash
npm test
```

To run tests for the order management service:

```bash
cd order-management
npm test
```

### Test Files

The project includes several test files:

- `test-user-routes.js`: Tests for user management endpoints
- `test-user-routes-comprehensive.js`: Comprehensive tests for user management
- `test-user-order-flow.js`: Tests for the complete user and order flow
- `order-management/tests/`: Tests for the order management service

## Error Handling

The E-commerce API uses standard HTTP status codes to indicate the success or failure of requests:

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `204 No Content`: Resource deleted successfully
- `400 Bad Request`: Invalid parameters or validation error
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses follow a consistent format:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## Security Considerations

The E-commerce API implements several security measures:

- **Password Hashing**: All passwords are hashed using bcrypt before storage
- **JWT Authentication**: Secure authentication using JSON Web Tokens
- **Input Validation**: All user inputs are validated to prevent injection attacks
- **Role-Based Access Control**: Different permissions for regular users and administrators
- **CORS**: Cross-Origin Resource Sharing is enabled to control which domains can access the API

## Project Structure

The project is organized into the following structure:

```
├── order-management/       # Order management service
│   ├── src/                # Source code
│   │   ├── app.js          # Express application setup
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Server entry point
│   └── tests/              # Test files
├── src/                    # Main application source code
│   ├── app.js              # Express application setup
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # Data models
│   ├── products/           # Product management module
│   ├── orders/             # Order management module
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── server.js           # Server entry point
├── utils/                  # Shared utilities
├── test-*.js               # Test files
├── package.json            # Project dependencies and scripts
└── README.md               # Project documentation
```

## Future Enhancements

Plans for future improvements include:

- **Database Integration**: Replace file-based storage with MongoDB or PostgreSQL
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **OAuth 2.0**: Add support for third-party authentication providers
- **Two-Factor Authentication**: Enhance security with 2FA
- **Payment Gateway Integration**: Add support for processing payments
- **Real-time Notifications**: Implement WebSockets for real-time updates
- **Product Reviews and Ratings**: Add support for customer reviews and ratings

## Contributing

Contributions to the E-commerce API are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License.

## Disclaimer

This implementation is for demonstration and development purposes only. It is not suitable for production use without additional security improvements and database integration.