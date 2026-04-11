import 'dotenv/config';
import connectDB from './config/mongodb.js';
import userModel from './models/userModel.js';

async function test() {
    await connectDB();
    const user = await userModel.findOne();
    if (!user) {
        console.log("No user found in DB");
        process.exit(0);
    }
    
    console.log("Found user:", user.email);
    
    // Test the API endpoint
    const response = await fetch('http://localhost:4000/api/auth/send-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
    });
    
    const data = await response.json();
    console.log("API Response:", data);
    process.exit(0);
}

test();
