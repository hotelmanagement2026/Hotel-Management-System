import dotenv from 'dotenv';
import transporter from './config/nodemailer.js';
dotenv.config();

async function main() {
    try {
        console.log('Sending test email via Brevo HTTP API...');
        const info = await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: process.env.SENDER_EMAIL, // send to self
            subject: "Test Email from Lumiere App (API Mode)",
            text: "This is a test email sent via Brevo API bypassing SMTP port blocks.",
        });
        console.log("Message sent successfully using API. ID:", info.messageId || info.id || info.id);
    } catch (error) {
        console.error("Error sending email:", error.message);
    }
}

main();
