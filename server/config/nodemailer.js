import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: 2525, // Port 587 is blocked by Render Free Tier. 2525 bypasses the block.
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    // Prevent SMTP from hanging the server
    connectionTimeout: 10000,   // 10s to connect
    greetingTimeout: 10000,     // 10s for greeting
    socketTimeout: 15000,       // 15s socket idle timeout
    pool: false,                // Don't pool - avoids stale connections on Render
    logger: false,
    debug: false,
});

export default transporter;