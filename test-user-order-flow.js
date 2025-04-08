/**
 * Test User and Order Flow
 * Demonstrates the complete flow from user creation to order creation
 */

const { v4: uuidv4 } = require('uuid');
const {
  createUser,
  loginUser,
  addItemToCart,
  getCart,
  createOrder,
  getOrder,
  deleteOrder,
  deleteUser
} = require('./utils/test-helpers');

// Configuration
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3000/api';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3001/api';

// Test data
const testUser = {
  username: `testuser_${Date.now()}`,
  email: `testuser_${Date.now()}@example.com`,
  password: 'Password123!'
};

const testProduct = {
  productId: uuidv4(),
  name: 'Test Product',
  price: 19.99,
  quantity: 2
};

const shippingAddress = {
  street: '123 Test Street',
  city: 'Test City',
  state: 'TS',
  zipCode: '12345',
  country: 'Test Country'
};

/**
 * Run the complete flow test
 */
async function runTest() {
  console.log('Starting User and Order Flow Test');
  console.log('=================================');
  
  let userId, token, orderId;
  
  try {
    // Step 1: Register a new user
    console.log('\n1. Registering a new user...');
    const registerResponse = await createUser(testUser);
    console.log('User registered successfully:', registerResponse.user);
    userId = registerResponse.user.id;
    
    // Step 2: Login with the user credentials
    console.log('\n2. Logging in with the new user...');
    const loginResponse = await loginUser({
      email: testUser.email,
      password: testUser.password
    });
    console.log('Login successful');
    token = loginResponse.token;
    
    // Step 3: Add items to the cart
    console.log('\n3. Adding items to the cart...');
    const cartResponse = await addItemToCart(userId, testProduct, token);
    console.log('Item added to cart:', cartResponse);
    
    // Step 4: Get the cart
    console.log('\n4. Getting the cart...');
    const cart = await getCart(userId, token);
    console.log('Cart retrieved:', cart);
    
    // Step 5: Create an order
    console.log('\n5. Creating an order...');
    const orderData = {
      userId: userId,
      items: cart.items,
      shippingAddress: shippingAddress
    };
    const order = await createOrder(orderData, token);
    console.log('Order created:', order);
    orderId = order.id;
    
    // Step 6: Get the order
    console.log('\n6. Getting the order...');
    const retrievedOrder = await getOrder(orderId, token);
    console.log('Order retrieved:', retrievedOrder);
    
    console.log('\nTest completed successfully!');
    console.log('=================================');
    
    // Optional: Clean up
    if (process.env.CLEANUP === 'true') {
      console.log('\nCleaning up...');
      if (orderId) {
        await deleteOrder(orderId, token);
        console.log('Order deleted');
      }
      if (userId) {
        await deleteUser(userId, token);
        console.log('User deleted');
      }
    }
    
  } catch (error) {
    console.error('\nTest failed:', error.message);
    console.error('Error details:', error.response?.data || error);
  }
}

// Run the test
runTest();