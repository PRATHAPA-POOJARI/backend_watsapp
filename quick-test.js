// quick-test.js
require('dotenv').config();
const axios = require('axios'); // npm install axios

const API_URL = 'http://localhost:5000/api/auth';
const email = 'prathappoojari607@gmail.com';
const username = 'Rahul';

async function testAuth() {
  try {
    console.log('1. Sending OTP...');
    
    // Send OTP
    const sendResponse = await axios.post(`${API_URL}/send-otp`, {
      email,
      username
    });
    
    console.log('✅ OTP sent:', sendResponse.data.msg);
    
    // Ask for OTP from user
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('Enter OTP from email: ', async (otp) => {
      console.log('2. Verifying OTP...');
      
      try {
        // Verify OTP
        const verifyResponse = await axios.post(`${API_URL}/verify-otp`, {
          email,
          otp
        });
        
        console.log('✅ Verification successful!');
        console.log('Token:', verifyResponse.data.token);
        console.log('User:', verifyResponse.data.user);
        
      } catch (verifyError) {
        console.error('❌ Verification failed:', verifyError.response?.data || verifyError.message);
      }
      
      readline.close();
    });
    
  } catch (sendError) {
    console.error('❌ Send OTP failed:', sendError.response?.data || sendError.message);
  }
}

testAuth();