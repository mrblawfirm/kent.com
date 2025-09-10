const fetch = require('node-fetch');

// Test login endpoint with the new simple login format
async function testLogin() {
  const testCredentials = [
    {
      userType: 'client',
      email: 'client@mrblaw.com',
      password: 'password123'
    },
    {
      userType: 'attorney',
      email: 'attorney@mrblaw.com',
      password: 'password123'
    },
    {
      userType: 'staff',
      email: 'staff@mrblaw.com',
      password: 'password123'
    }
  ];

  console.log('Testing login endpoint with simple login format...\n');

  for (const credentials of testCredentials) {
    try {
      console.log(`Testing ${credentials.userType} login...`);
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${credentials.userType} login successful!`);
        console.log(`   User: ${result.user.name}`);
        console.log(`   Redirect: ${result.redirectUrl}`);
        console.log(`   Token: ${result.token ? 'Generated' : 'Missing'}`);
      } else {
        console.log(`❌ ${credentials.userType} login failed:`);
        console.log(`   ${result.message}`);
      }
      
      console.log(''); // Empty line for readability
      
    } catch (error) {
      console.log(`❌ ${credentials.userType} network error:`, error.message);
      console.log(''); // Empty line for readability
    }
  }

  // Test invalid credentials
  console.log('Testing invalid credentials...');
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userType: 'client',
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.log('✅ Invalid credentials properly rejected');
      console.log(`   Message: ${result.message}`);
    } else {
      console.log('❌ Invalid credentials were accepted (this should not happen)');
    }
    
  } catch (error) {
    console.log('❌ Network error during invalid credentials test:', error.message);
  }
}

// Test if server is running
async function testServer() {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    if (response.ok) {
      console.log('✅ Server is running\n');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first:');
    console.log('   npm run dev\n');
    return false;
  }
}

// Main execution
async function main() {
  console.log('=== MRB Law Login Test ===\n');
  
  const serverRunning = await testServer();
  if (serverRunning) {
    await testLogin();
  }
  
  console.log('\n=== Test Complete ===');
}

main();