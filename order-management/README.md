# Order Management API

## Overview
This component handles all order-related operations including order creation, updates, status management, and shopping cart functionality. It manages order data persistence using JSON files and integrates with Product and Payment services for complete order processing.

## Technologies
- Node.js v16+ runtime environment
- Express.js v4.17+ web framework
- Express-validator v6.14+ for input validation
- Node fs module for JSON file operations
- JSON for data storage and exchange
- Swagger UI for API documentation
- Jest for unit testing

## Getting Started

### Installation
```bash
npm install
```

### Running the Application
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

### Testing
```bash
npm test
```

## API Documentation
Swagger documentation is available at `http://localhost:3001/api-docs` when the server is running.

## Directory Structure
- `src/`
  - `models/` - Data models for orders and carts
  - `controllers/` - Business logic
  - `routes/` - API endpoints
  - `middleware/` - Auth, validation, etc.
  - `services/` - Integration with user-management
  - `config/` - Configuration files
  - `data/` - JSON storage
  - `utils/` - Helper functions
- `tests/` - Jest tests
