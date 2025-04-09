/**
 * Integration tests for authentication flow between user-management and order-management
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');
const userService = require('../../src/services/userService');
const authConfig = require('../../src/config/auth');

// Mock axios for testing
jest.mock('axios');

// Configuration
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3000/api';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3001/api';

describe('Authentication Integration Tests', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Service Integration', () => {
    const mockToken = 'mock-jwt-token';
    const mockUserId = 'user-123';
    const mockUserData = {
      id: mockUserId,
      username: 'testuser',
      email: 'test@example.com',
      role: 'user'
    };

    test('verifyToken should successfully validate a token with user-management service', async () => {
      // Mock the axios post response for token verification
      axios.post.mockResolvedValueOnce({
        data: {
          valid: true,
          user: mockUserData
        }
      });

      const result = await userService.verifyToken(mockToken);

      // Verify axios was called with correct parameters
      expect(axios.post).toHaveBeenCalledWith(
        `${USER_SERVICE_URL}/auth/verify-token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          },
          timeout: expect.any(Number)
        }
      );

      // Verify the result contains the expected data
      expect(result).toEqual({
        valid: true,
        user: mockUserData
      });
    });

    test('verifyToken should handle invalid tokens', async () => {
      // Mock the axios post response for invalid token
      axios.post.mockRejectedValueOnce({
        response: {
          status: 403,
          statusText: 'Forbidden',
          data: { error: 'Invalid token' }
        }
      });

      // Verify the function throws the expected error
      await expect(userService.verifyToken(mockToken)).rejects.toThrow('Invalid or expired token');

      // Verify axios was called with correct parameters
      expect(axios.post).toHaveBeenCalledWith(
        `${USER_SERVICE_URL}/auth/verify-token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          },
          timeout: expect.any(Number)
        }
      );
    });

    test('getUserById should successfully retrieve user data from user-management service', async () => {
      // Mock the axios get response for user retrieval
      axios.get.mockResolvedValueOnce({
        data: mockUserData
      });

      const result = await userService.getUserById(mockUserId, mockToken);

      // Verify axios was called with correct parameters
      expect(axios.get).toHaveBeenCalledWith(
        `${USER_SERVICE_URL}/users/${mockUserId}`,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          },
          timeout: expect.any(Number)
        }
      );

      // Verify the result contains the expected data
      expect(result).toEqual(mockUserData);
    });

    test('getUserById should handle user not found', async () => {
      // Mock the axios get response for user not found
      axios.get.mockRejectedValueOnce({
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { error: 'User not found' }
        }
      });

      // Verify the function throws the expected error
      await expect(userService.getUserById(mockUserId, mockToken)).rejects.toThrow('Failed to retrieve user data: 404 Not Found');

      // Verify axios was called with correct parameters
      expect(axios.get).toHaveBeenCalledWith(
        `${USER_SERVICE_URL}/users/${mockUserId}`,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          },
          timeout: expect.any(Number)
        }
      );
    });

    test('validateUser should return true for existing users', async () => {
      // Mock the getUserById method to simulate a successful user retrieval
      axios.get.mockResolvedValueOnce({
        data: mockUserData
      });

      const result = await userService.validateUser(mockUserId, mockToken);

      // Verify axios was called with correct parameters
      expect(axios.get).toHaveBeenCalledWith(
        `${USER_SERVICE_URL}/users/${mockUserId}`,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          },
          timeout: expect.any(Number)
        }
      );

      // Verify the result is true for existing user
      expect(result).toBe(true);
    });

    test('validateUser should return false for non-existing users', async () => {
      // Mock the getUserById method to simulate a user not found
      axios.get.mockRejectedValueOnce({
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { error: 'User not found' }
        }
      });

      const result = await userService.validateUser('non-existent-user', mockToken);

      // Verify axios was called with correct parameters
      expect(axios.get).toHaveBeenCalledWith(
        `${USER_SERVICE_URL}/users/non-existent-user`,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          },
          timeout: expect.any(Number)
        }
      );

      // Verify the result is false for non-existing user
      expect(result).toBe(false);
    });

    test('isAdmin should return true for admin users', async () => {
      // Mock the getUserById method to simulate an admin user
      axios.get.mockResolvedValueOnce({
        data: {
          ...mockUserData,
          role: 'admin'
        }
      });

      const result = await userService.isAdmin(mockUserId, mockToken);

      // Verify axios was called with correct parameters
      expect(axios.get).toHaveBeenCalledWith(
        `${USER_SERVICE_URL}/users/${mockUserId}`,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          },
          timeout: expect.any(Number)
        }
      );

      // Verify the result is true for admin user
      expect(result).toBe(true);
    });

    test('isAdmin should return false for non-admin users', async () => {
      // Mock the getUserById method to simulate a regular user
      axios.get.mockResolvedValueOnce({
        data: mockUserData // role is 'user'
      });

      const result = await userService.isAdmin(mockUserId, mockToken);

      // Verify axios was called with correct parameters
      expect(axios.get).toHaveBeenCalledWith(
        `${USER_SERVICE_URL}/users/${mockUserId}`,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          },
          timeout: expect.any(Number)
        }
      );

      // Verify the result is false for non-admin user
      expect(result).toBe(false);
    });

    test('getUserProfile should successfully retrieve user profile from user-management service', async () => {
      // Mock the axios get response for profile retrieval
      axios.get.mockResolvedValueOnce({
        data: mockUserData
      });

      const result = await userService.getUserProfile(mockToken);

      // Verify axios was called with correct parameters
      expect(axios.get).toHaveBeenCalledWith(
        `${USER_SERVICE_URL}/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          },
          timeout: expect.any(Number)
        }
      );

      // Verify the result contains the expected data
      expect(result).toEqual(mockUserData);
    });

    test('getUserProfile should handle unauthorized access', async () => {
      // Mock the axios get response for unauthorized access
      axios.get.mockRejectedValueOnce({
        response: {
          status: 401,
          statusText: 'Unauthorized',
          data: { error: 'Authentication required' }
        }
      });

      // Verify the function throws the expected error
      await expect(userService.getUserProfile(mockToken)).rejects.toThrow('Failed to retrieve user profile: 401 Unauthorized');

      // Verify axios was called with correct parameters
      expect(axios.get).toHaveBeenCalledWith(
        `${USER_SERVICE_URL}/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          },
          timeout: expect.any(Number)
        }
      );
    });
  });

  describe('JWT Token Handling', () => {
    test('local JWT verification should work with tokens issued by user-management', () => {
      // Create a token similar to what user-management would issue
      const payload = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      };
      
      const token = jwt.sign(payload, authConfig.jwtSecret, { expiresIn: '1h' });
      
      // Verify the token can be decoded by order-management
      const decoded = jwt.verify(token, authConfig.jwtSecret);
      
      // Check that the decoded payload matches the original
      expect(decoded).toMatchObject(payload);
    });
  });
});