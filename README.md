# User Management API

A mock implementation of a RESTful User Management API for e-commerce applications. This project provides a foundation for user authentication, authorization, and management with features like user registration, email verification, password reset, and profile management.

## Features

- **User Management**: Create, read, update, and delete user accounts
- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control (User/Admin roles)
- **Email Verification**: Account verification via email
- **Password Management**: Secure password reset functionality
- **API Documentation**: Interactive Swagger documentation
- **Data Validation**: Request validation using express-validator
- **Mock Data Storage**: JSON file-based data persistence for development

## Technologies Used

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Passport.js**: Authentication middleware
- **JWT**: JSON Web Tokens for secure authentication
- **Bcrypt**: Password hashing
- **Nodemailer**: Email sending functionality
- **Swagger**: API documentation
- **Express Validator**: Request validation
- **UUID**: Unique identifier generation

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Mock-E-commerce-32515
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

4. The server will start on port 3000 (default) or the port specified in the `PORT` environment variable.
   - API: http://localhost:3000
   - Swagger Documentation: http://localhost:3000/api-docs

## Environment Variables

Create a `.env` file in the root directory with the following variables (optional):

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
SMTP_SECURE=false
EMAIL_FROM="User Management <noreply@example.com>"
BASE_URL=http://localhost:3000
```

## API Documentation

The API is documented using Swagger. Once the server is running, you can access the interactive documentation at:

```
http://localhost:3000/api-docs
```

### API Endpoints

#### User Management

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update user by ID
- `DELETE /api/users/:id` - Delete user by ID

#### Authentication (Implemented in Controller but Routes Not Connected)

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/verify-email` - Verify user email
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout user (client-side)

## Project Structure

```
├── src/
│   ├── config/           # Configuration files
│   │   ├── auth.js       # Authentication configuration
│   │   ├── email.js      # Email configuration
│   │   └── swagger.js    # Swagger configuration
│   ├── controllers/      # Request handlers
│   │   ├── authController.js  # Authentication controller
│   │   └── userController.js  # User management controller
│   ├── data/             # Mock data storage
│   │   └── users.json    # User data storage
│   ├── middleware/       # Express middleware
│   │   ├── auth.js       # Authentication middleware
│   │   └── validation.js # Request validation middleware
│   ├── models/           # Data models
│   │   └── userModel.js  # User model for CRUD operations
│   ├── routes/           # API routes
│   │   └── users.js      # User routes
│   ├── services/         # Business logic services
│   │   └── emailService.js  # Email sending service
│   ├── app.js            # Express application setup
│   └── server.js         # Server entry point
├── package.json          # Project dependencies and scripts
└── README.md            # Project documentation
```

## Authentication and Authorization

### Authentication Flow

1. **Registration**: User registers with email, username, and password
2. **Email Verification**: User verifies email via a link sent to their email
3. **Login**: User logs in with email and password to receive JWT token
4. **Token Usage**: JWT token is included in Authorization header for protected routes
5. **Token Refresh**: Refresh token is used to obtain a new JWT token when expired

### Authorization

The API supports two user roles:

- **User**: Regular user with access to their own data
- **Admin**: Administrator with access to all user data

Middleware functions `isAuthenticated` and `isAdmin` are used to protect routes based on authentication status and user role.

## Data Storage

This mock implementation uses a JSON file (`src/data/users.json`) for data storage. In a production environment, this would be replaced with a proper database like MongoDB, PostgreSQL, or MySQL.

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

## Development

### Running in Development Mode

```bash
npm run dev
```

This will start the server with nodemon, which automatically restarts the server when changes are detected.

## Testing

Currently, this project does not include automated tests. In a production environment, you would want to add:

- Unit tests for models and services
- Integration tests for API endpoints
- End-to-end tests for complete user flows

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens are used for stateless authentication
- Input validation is performed using express-validator
- Email verification is required for new accounts
- Password reset requires email verification

## Future Enhancements

- Add automated testing
- Implement rate limiting for API endpoints
- Add database integration (MongoDB, PostgreSQL, etc.)
- Implement OAuth 2.0 for third-party authentication
- Add two-factor authentication
- Implement account lockout after failed login attempts
- Add logging and monitoring

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This is a mock implementation intended for demonstration and development purposes only. It is not suitable for production use without additional security measures and proper database integration.