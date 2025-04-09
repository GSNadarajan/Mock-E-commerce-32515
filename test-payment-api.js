/**
 * Payment API Tests
 * Tests for the payment API endpoints
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const TEST_RESULTS_FILE = path.join(__dirname, 'payment-test-results.json');

// Test data
const testUser = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'Password123!',
  name: 'Test User',
  role: 'admin', // Admin role to access all payment endpoints
  isVerified: true // Ensure the user is verified
};

const testPayment = {
  user_id: 12345,
  order_id: 5003,
  payment_method: 'credit_card',
  amount: 1200.99
};

// Authentication token
let authToken = null;

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

/**
 * Run a test and record the result
 * @param {string} testName - Name of the test
 * @param {Function} testFn - Test function to run
 */
async function runTest(testName, testFn) {
  testResults.total++;
  
  console.log(`\n🧪 Running test: ${testName}`);
  
  const startTime = Date.now();
  let status = 'passed';
  let errorMessage = null;
  let failureLogs = null;
  
  try {
    await testFn();
    testResults.passed++;
    console.log(`✅ Test passed: ${testName}`);
  } catch (error) {
    status = 'failed';
    testResults.failed++;
    
    errorMessage = error.message;
    failureLogs = error.response ? 
      `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}` : 
      `${error.stack}`;
    
    console.error(`❌ Test failed: ${testName}`);
    console.error(`   Error: ${errorMessage}`);
    console.error(`   Details: ${failureLogs}`);
  }
  
  const duration = Date.now() - startTime;
  
  testResults.tests.push({
    name: testName,
    status,
    duration: `${duration}ms`,
    error_message: errorMessage,
    failure_logs: failureLogs
  });
}

/**
 * Register a test user
 */
async function registerTestUser() {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('   User registered successfully');
    return response.data;
  } catch (error) {
    // If user already exists, that's fine
    if (error.response && (error.response.status === 409 || (error.response.data && error.response.data.error === 'Email already in use'))) {
      console.log('   User already exists, proceeding with login');
      return null;
    }
    throw error;
  }
}

/**
 * Login with test user credentials
 */
async function loginTestUser() {
  const credentials = {
    email: testUser.email,
    password: testUser.password
  };
  
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  
  if (!response.data.token) {
    throw new Error('Login failed: No token received');
  }
  
  authToken = response.data.token;
  console.log('   Login successful, token received');
}

/**
 * Test POST /api/payments endpoint
 */
async function testCreatePayment() {
  const response = await axios.post(
    `${API_URL}/payments`, 
    testPayment,
    {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }
  );
  
  // Verify status code
  if (response.status !== 201) {
    throw new Error(`Expected status code 201, got ${response.status}`);
  }
  
  // Verify response contains required fields
  if (!response.data.message) {
    throw new Error('Response missing "message" field');
  }
  
  if (!response.data.transaction_id) {
    throw new Error('Response missing "transaction_id" field');
  }
  
  console.log(`   Transaction ID: ${response.data.transaction_id}`);
  console.log(`   Message: ${response.data.message}`);
}

/**
 * Test GET /api/payments endpoint
 */
async function testGetAllPayments() {
  const response = await axios.get(
    `${API_URL}/payments`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }
  );
  
  // Verify status code
  if (response.status !== 200) {
    throw new Error(`Expected status code 200, got ${response.status}`);
  }
  
  // Verify response is an array
  if (!Array.isArray(response.data)) {
    throw new Error('Expected response to be an array');
  }
  
  console.log(`   Retrieved ${response.data.length} payments`);
}

/**
 * Save test results to a JSON file
 */
async function saveTestResults() {
  try {
    // Calculate summary
    const summary = {
      total_tests: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      skipped: testResults.skipped,
      success_rate: `${Math.round((testResults.passed / testResults.total) * 100)}%`,
      execution_time: new Date().toISOString()
    };
    
    // Prepare final results
    const finalResults = {
      summary,
      tests: testResults.tests
    };
    
    // Write to file
    await fs.writeFile(TEST_RESULTS_FILE, JSON.stringify(finalResults, null, 2));
    console.log(`\n📝 Test results saved to ${TEST_RESULTS_FILE}`);
  } catch (error) {
    console.error(`Error saving test results: ${error.message}`);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting Payment API Tests');
  
  const startTime = Date.now();
  
  try {
    // Setup: Register and login
    console.log('\n🔐 Setting up authentication...');
    await registerTestUser();
    await loginTestUser();
    
    // Run tests
    await runTest('Create Payment', testCreatePayment);
    await runTest('Get All Payments', testGetAllPayments);
  } catch (error) {
    console.error(`\n❌ Setup failed: ${error.message}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}, Data:`, error.response.data);
    }
  }
  
  const totalTime = Date.now() - startTime;
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`   Total: ${testResults.total}`);
  console.log(`   Passed: ${testResults.passed}`);
  console.log(`   Failed: ${testResults.failed}`);
  console.log(`   Skipped: ${testResults.skipped}`);
  console.log(`   Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  console.log(`   Total Time: ${totalTime}ms`);
  
  // Save results
  await saveTestResults();
}

// Run tests
runTests().catch(error => {
  console.error(`Unhandled error in test suite: ${error.message}`);
  process.exit(1);
});
