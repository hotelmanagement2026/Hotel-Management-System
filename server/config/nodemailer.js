import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
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