/**
 * Test Helper Utilities
 * Provides helper functions for testing and demonstration
 */

const axios = require('axios');

// Configuration
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3000/api';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3001/api';

/**
 * Create a test user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
async function createUser(userData) {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Verify a user's email (simulated)
 * @param {string} token - Verification token
 * @returns {Promise<Object>} Response data
 */
async function verifyUser(token) {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/auth/verify-email?token=${token}`);
    return response.data;
  } catch (error) {
    console.error('Error verifying user:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Login a user
 * @param {Object} credentials - User credentials
 * @returns {Promise<Object>} Login response with token
 */
async function loginUser(credentials) {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/auth/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create or update a cart
 * @param {string} userId - User ID
 * @param {Array} items - Cart items
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Cart data
 */
async function addItemToCart(userId, item, token) {
  try {
    const response = await axios.post(
      `${ORDER_SERVICE_URL}/carts/${userId}/items`,
      item,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding item to cart:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get a user's cart
 * @param {string} userId - User ID
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Cart data
 */
async function getCart(userId, token) {
  try {
    const response = await axios.get(
      `${ORDER_SERVICE_URL}/carts/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting cart:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create an order
 * @param {Object} orderData - Order data
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Created order
 */
async function createOrder(orderData, token) {
  try {
    const response = await axios.post(
      `${ORDER_SERVICE_URL}/orders`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get an order by ID
 * @param {string} orderId - Order ID
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Order data
 */
async function getOrder(orderId, token) {
  try {
    const response = await axios.get(
      `${ORDER_SERVICE_URL}/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting order:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Delete an order
 * @param {string} orderId - Order ID
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Response data
 */
async function deleteOrder(orderId, token) {
  try {
    const response = await axios.delete(
      `${ORDER_SERVICE_URL}/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Delete a user
 * @param {string} userId - User ID
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Response data
 */
async function deleteUser(userId, token) {
  try {
    const response = await axios.delete(
      `${USER_SERVICE_URL}/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  createUser,
  verifyUser,
  loginUser,
  addItemToCart,
  getCart,
  createOrder,
  getOrder,
  deleteOrder,
  deleteUser
};