const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

console.log('Testing connection to:', uri.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000 // Timeout faster for testing
})
    .then(() => {
        console.log('✅ SUCCESS: MongoDB Connected!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ ERROR: Connection Failed');
        console.error('Reason:', err.message);

        if (err.message.includes('bad auth')) {
            console.error('👉 CAUSE: Incorrect Username or Password.');
        } else if (err.message.includes('querySrv')) {
            console.error('👉 CAUSE: DNS/Network Issue. Try using a different network or Google DNS.');
        } else {
            console.error('👉 CAUSE: Likely IP Blocked (Check Atlas Network Access) or Firewall.');
        }
        process.exit(1);
    });
