import dotenv from 'dotenv';
import { Resend } from 'resend';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
    console.log('Testing Resend with API Key:', process.env.RESEND_API_KEY ? 'Present' : 'MISSING');
    
    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: process.env.SENDER_EMAIL || 'soumikjana01@gmail.com',
            subject: 'Resend Test - Lumiere Hotels',
            html: '<h1>Resend is Working!</h1><p>Your email integration is now using Resend API instead of Gmail SMTP.</p>'
        });

        if (error) {
            console.error('Resend Test Failed:', error.message);
            return;
        }

        console.log('Resend Test Success! ID:', data.id);
    } catch (err) {
        console.error('Unexpected Error during test:', err.message);
    }
}

testResend();
