const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/api/users';
let userId = null;

// Test data
const newUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password123!'
};

const updatedUser = {
  username: 'updateduser',
  email: 'updated@example.com'
};

// Helper function to log test results
function logResult(testName, success, response, error = null) {
  console.log(`\n----- ${testName} -----`);
  if (success) {
    console.log('✅ PASSED');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } else {
    console.log('❌ FAILED');
    if (response) {
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
    }
    if (error) {
      console.log('Error:', error.message);
    }
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting User API Tests...');
  
  try {
    // Test 1: GET all users (initially empty)
    try {
      const response = await axios.get(API_URL);
      logResult('GET /api/users (Initial)', true, response);
    } catch (error) {
      logResult('GET /api/users (Initial)', false, error.response, error);
    }

    // Test 2: POST create a new user
    try {
      const response = await axios.post(API_URL, newUser);
      userId = response.data.id; // Save the ID for later tests
      logResult('POST /api/users', true, response);
    } catch (error) {
      logResult('POST /api/users', false, error.response, error);
    }

    // Test 3: GET all users (should now have one user)
    try {
      const response = await axios.get(API_URL);
      logResult('GET /api/users (After Creation)', true, response);
    } catch (error) {
      logResult('GET /api/users (After Creation)', false, error.response, error);
    }

    // Test 4: GET user by ID
    if (userId) {
      try {
        const response = await axios.get(`${API_URL}/${userId}`);
        logResult(`GET /api/users/${userId}`, true, response);
      } catch (error) {
        logResult(`GET /api/users/${userId}`, false, error.response, error);
      }
    } else {
      console.log('\n⚠️ Skipping GET user by ID test because user creation failed');
    }

    // Test 5: PUT update user
    if (userId) {
      try {
        const response = await axios.put(`${API_URL}/${userId}`, updatedUser);
        logResult(`PUT /api/users/${userId}`, true, response);
      } catch (error) {
        logResult(`PUT /api/users/${userId}`, false, error.response, error);
      }
    } else {
      console.log('\n⚠️ Skipping PUT update user test because user creation failed');
    }

    // Test 6: DELETE user
    if (userId) {
      try {
        const response = await axios.delete(`${API_URL}/${userId}`);
        logResult(`DELETE /api/users/${userId}`, true, response);
      } catch (error) {
        logResult(`DELETE /api/users/${userId}`, false, error.response, error);
      }
    } else {
      console.log('\n⚠️ Skipping DELETE user test because user creation failed');
    }

    // Test 7: Verify user was deleted
    if (userId) {
      try {
        const response = await axios.get(`${API_URL}/${userId}`);
        logResult(`GET /api/users/${userId} (After Deletion)`, false, response);
      } catch (error) {
        // This should fail with a 404, which is what we want
        if (error.response && error.response.status === 404) {
          logResult(`GET /api/users/${userId} (After Deletion - Should 404)`, true, error.response);
        } else {
          logResult(`GET /api/users/${userId} (After Deletion)`, false, error.response, error);
        }
      }
    } else {
      console.log('\n⚠️ Skipping verification of deletion because user creation failed');
    }

    console.log('\n🏁 All tests completed!');
  } catch (error) {
    console.error('\n❌ Unexpected error during tests:', error.message);
  }
}

// Run the tests
runTests();