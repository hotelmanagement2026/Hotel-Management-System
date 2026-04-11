import nodemailer from 'nodemailer';
import dns from 'dns';

// Force node to prefer IPv4 over IPv6. This often fixes connection timeouts on cloud hosts like Render
// when sending mail, as Google's IPv6 SMTP can drop packets from unrecognized cloud IPs.
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    family: 4, // Force IPv4 connection to prevent ENETUNREACH across IPv6 boundaries
});

export default transporter;