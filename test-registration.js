const fetch = require('node-fetch');

// Test registration endpoint
async function testRegistration() {
  const testData = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
    userType: 'client',
    phone: '09123456789',
    gender: 'male',
    dateOfBirth: '1995-01-01',
    address: {
      street: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      country: 'Philippines'
    }
  };

  try {
    console.log('Testing registration endpoint...');
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('User ID:', result.user.id);
      console.log('Client ID:', result.user.clientId);
    } else {
      console.log('❌ Registration failed:');
      console.log(result);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    console.log('Make sure the server is running on port 5000');
  }
}

testRegistration();