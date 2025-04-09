/**
 * Jest configuration for payment API tests
 */

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  verbose: true,
  setupFiles: ['<rootDir>/jest.setup.js'],
  testTimeout: 10000, // 10 seconds timeout for tests
};
