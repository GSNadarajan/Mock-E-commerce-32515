const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3001/api/users';
let userId1 = null;
let userId2 = null;

// Test data
const user1 = {
  username: 'testuser1',
  email: 'test1@example.com',
  password: 'Password123!'
};

const user2 = {
  username: 'testuser2',
  email: 'test2@example.com',
  password: 'Password123!'
};

const updatedUser = {
  username: 'updateduser',
  email: 'updated@example.com'
};

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Helper function to log test results
function logResult(testName, success, response, error = null) {
  testResults.total++;
  
  const testResult = {
    test_id: testName,
    status: success ? 'passed' : 'failed',
    duration: 'N/A',
    error_message: null,
    failure_logs: null,
    command_executed: `axios ${testName}`,
    reason_for_failure: null
  };
  
  console.log(`\n----- ${testName} -----`);
  if (success) {
    console.log('✅ PASSED');
    testResults.passed++;
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } else {
    console.log('❌ FAILED');
    testResults.failed++;
    if (response) {
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      testResult.error_message = `Status: ${response.status}`;
      testResult.failure_logs = JSON.stringify(response.data);
    }
    if (error) {
      console.log('Error:', error.message);
      testResult.error_message = error.message;
      testResult.reason_for_failure = error.message;
    }
  }
  
  testResults.tests.push(testResult);
}

function logSkipped(testName, reason) {
  testResults.total++;
  testResults.skipped++;
  
  const testResult = {
    test_id: testName,
    status: 'skipped',
    duration: 'N/A',
    error_message: null,
    failure_logs: null,
    command_executed: `axios ${testName}`,
    reason_for_failure: reason
  };
  
  console.log(`\n----- ${testName} -----`);
  console.log('⚠️ SKIPPED');
  console.log('Reason:', reason);
  
  testResults.tests.push(testResult);
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting User API Tests...');
  const startTime = Date.now();
  
  try {
    // Test 1: GET all users (initially empty)
    try {
      const response = await axios.get(API_URL);
      logResult('GET /api/users (Initial)', true, response);
    } catch (error) {
      logResult('GET /api/users (Initial)', false, error.response, error);
    }

    // Test 2: POST create first user
    try {
      const response = await axios.post(API_URL, user1);
      userId1 = response.data.id; // Save the ID for later tests
      logResult('POST /api/users (User 1)', true, response);
    } catch (error) {
      logResult('POST /api/users (User 1)', false, error.response, error);
    }

    // Test 3: POST create second user
    try {
      const response = await axios.post(API_URL, user2);
      userId2 = response.data.id; // Save the ID for later tests
      logResult('POST /api/users (User 2)', true, response);
    } catch (error) {
      logResult('POST /api/users (User 2)', false, error.response, error);
    }

    // Test 4: GET all users (should now have two users)
    try {
      const response = await axios.get(API_URL);
      logResult('GET /api/users (After Creation)', true, response);
    } catch (error) {
      logResult('GET /api/users (After Creation)', false, error.response, error);
    }

    // Test 5: GET user by ID (User 1)
    if (userId1) {
      try {
        const response = await axios.get(`${API_URL}/${userId1}`);
        logResult(`GET /api/users/${userId1}`, true, response);
      } catch (error) {
        logResult(`GET /api/users/${userId1}`, false, error.response, error);
      }
    } else {
      logSkipped(`GET /api/users/:id (User 1)`, 'User creation failed');
    }

    // Test 6: GET user by ID (User 2)
    if (userId2) {
      try {
        const response = await axios.get(`${API_URL}/${userId2}`);
        logResult(`GET /api/users/${userId2}`, true, response);
      } catch (error) {
        logResult(`GET /api/users/${userId2}`, false, error.response, error);
      }
    } else {
      logSkipped(`GET /api/users/:id (User 2)`, 'User creation failed');
    }

    // Test 7: Search users
    try {
      const response = await axios.get(`${API_URL}/search?query=test`);
      logResult('GET /api/users/search?query=test', true, response);
    } catch (error) {
      logResult('GET /api/users/search?query=test', false, error.response, error);
    }

    // Test 8: PUT update user
    if (userId1) {
      try {
        const response = await axios.put(`${API_URL}/${userId1}`, updatedUser);
        logResult(`PUT /api/users/${userId1}`, true, response);
      } catch (error) {
        logResult(`PUT /api/users/${userId1}`, false, error.response, error);
      }
    } else {
      logSkipped(`PUT /api/users/:id`, 'User creation failed');
    }

    // Test 9: DELETE user 1
    if (userId1) {
      try {
        const response = await axios.delete(`${API_URL}/${userId1}`);
        logResult(`DELETE /api/users/${userId1}`, true, response);
      } catch (error) {
        logResult(`DELETE /api/users/${userId1}`, false, error.response, error);
      }
    } else {
      logSkipped(`DELETE /api/users/:id (User 1)`, 'User creation failed');
    }

    // Test 10: DELETE user 2
    if (userId2) {
      try {
        const response = await axios.delete(`${API_URL}/${userId2}`);
        logResult(`DELETE /api/users/${userId2}`, true, response);
      } catch (error) {
        logResult(`DELETE /api/users/${userId2}`, false, error.response, error);
      }
    } else {
      logSkipped(`DELETE /api/users/:id (User 2)`, 'User creation failed');
    }

    // Test 11: Verify user 1 was deleted
    if (userId1) {
      try {
        const response = await axios.get(`${API_URL}/${userId1}`);
        logResult(`GET /api/users/${userId1} (After Deletion)`, false, response);
      } catch (error) {
        // This should fail with a 404, which is what we want
        if (error.response && error.response.status === 404) {
          logResult(`GET /api/users/${userId1} (After Deletion - Should 404)`, true, error.response);
        } else {
          logResult(`GET /api/users/${userId1} (After Deletion)`, false, error.response, error);
        }
      }
    } else {
      logSkipped(`GET /api/users/:id (After Deletion - User 1)`, 'User creation failed');
    }

    // Test 12: Verify user 2 was deleted
    if (userId2) {
      try {
        const response = await axios.get(`${API_URL}/${userId2}`);
        logResult(`GET /api/users/${userId2} (After Deletion)`, false, response);
      } catch (error) {
        // This should fail with a 404, which is what we want
        if (error.response && error.response.status === 404) {
          logResult(`GET /api/users/${userId2} (After Deletion - Should 404)`, true, error.response);
        } else {
          logResult(`GET /api/users/${userId2} (After Deletion)`, false, error.response, error);
        }
      }
    } else {
      logSkipped(`GET /api/users/:id (After Deletion - User 2)`, 'User creation failed');
    }

    // Test 13: Attempt to create a user with invalid data (missing required fields)
    try {
      const response = await axios.post(API_URL, { username: 'incomplete' });
      logResult('POST /api/users (Invalid Data)', false, response);
    } catch (error) {
      // This should fail with a 400, which is what we want
      if (error.response && error.response.status === 400) {
        logResult('POST /api/users (Invalid Data - Should 400)', true, error.response);
      } else {
        logResult('POST /api/users (Invalid Data)', false, error.response, error);
      }
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // in seconds
    
    console.log('\n🏁 All tests completed!');
    console.log(`\nTest Summary:`);
    console.log(`Total: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Skipped: ${testResults.skipped}`);
    console.log(`Duration: ${duration.toFixed(2)} seconds`);
    
    // Add duration to test results
    testResults.duration = `${duration.toFixed(2)} seconds`;
    
    // Write test results to file
    const fs = require('fs');
    fs.writeFileSync('test-results.json', JSON.stringify(testResults, null, 2));
    console.log('\nTest results written to test-results.json');
    
  } catch (error) {
    console.error('\n❌ Unexpected error during tests:', error.message);
  }
}

// Run the tests
runTests();