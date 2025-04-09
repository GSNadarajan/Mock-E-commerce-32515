# Integration Tests for Order Management and User Management

This directory contains integration tests that verify the connection between the user-management and order-management components.

## Test Files

1. **auth_integration.test.js**
   - Tests the authentication flow between user-management and order-management
   - Verifies token validation, user retrieval, and admin role checking
   - Tests JWT token compatibility between services

2. **order_user_integration.test.js**
   - Tests order creation with user validation
   - Verifies that orders can only be created for valid users
   - Tests authorization rules for order creation and retrieval
   - Verifies error handling for invalid user IDs

3. **error_handling_integration.test.js**
   - Tests error handling scenarios between the components
   - Verifies graceful handling of service unavailability
   - Tests timeout and connection error handling
   - Verifies middleware error responses

4. **user_order_flow_integration.test.js**
   - End-to-end test of the complete user-order flow
   - Tests user registration, login, cart operations, and order creation
   - Verifies error scenarios in the flow
   - Tests cleanup operations

## Running the Tests

To run all integration tests:

```bash
npm test -- --testPathPattern=tests/integration --watchAll=false
```

To run a specific test file:

```bash
npm test -- --testPathPattern=tests/integration/auth_integration.test.js --watchAll=false
```

## Test Coverage

These integration tests focus on the following areas:

1. **Authentication Flow**
   - Token verification between services
   - User validation
   - Role-based access control

2. **Order Creation with User Validation**
   - Ensuring orders can only be created for valid users
   - Proper error handling for invalid users
   - Authorization rules for order operations

3. **Error Handling**
   - Service unavailability scenarios
   - Connection timeouts
   - Invalid token handling
   - Middleware error responses

4. **End-to-End Flow**
   - Complete user registration to order creation flow
   - Cart operations
   - Order management
   - Error scenarios throughout the flow

## Dependencies

These tests rely on the following mocked dependencies:

- axios: For HTTP requests between services
- jsonwebtoken: For token verification
- User and Order models: For data operations

## Notes

- These tests use mocks to simulate the interaction between services
- Some tests may fail if the actual implementation differs from the expected behavior
- Update the mocks if the implementation changes