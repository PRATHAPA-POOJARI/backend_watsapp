// test-gmail.js
require('dotenv').config();

console.log('Testing Gmail configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS?.length);
console.log('EMAIL_PASS value:', '"' + process.env.EMAIL_PASS + '"');