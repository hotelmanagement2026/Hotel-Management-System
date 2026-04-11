import nodemailer from 'nodemailer';

// Create a transporter using Brevo SMTP settings
// This allows sending to any recipient after verifying your sender email in the Brevo dashboard.
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // TLS
    auth: {
        user: process.env.SENDER_EMAIL, // Your verified Brevo sender email
        pass: process.env.BREVO_API_KEY, // Your Brevo SMTP/Master API Key
    },
});

export default transporter;