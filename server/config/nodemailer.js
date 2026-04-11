import fs from 'fs';

/**
 * FINAL FIX: Compatibility shim to mimic nodemailer transporter using BREVO HTTP API.
 * Render.com blocks Port 587 (SMTP) on the free tier, but Port 443 (HTTPS) is always open.
 */
const transporter = {
    sendMail: async (options) => {
        const { from, to, subject, text, html, attachments } = options;
        
        console.log(`[Email] Attempting to send to: ${to} via Brevo API...`);
        
        const senderEmail = from || process.env.SENDER_EMAIL;
        const payload = {
            sender: { email: senderEmail, name: "Lumière Luxury Hotels" },
            to: (Array.isArray(to) ? to : [to]).map(email => ({ email })),
            subject: subject,
            htmlContent: html || text,
        };
        
        if (attachments && attachments.length > 0) {
            payload.attachment = await Promise.all(attachments.map(async (att) => {
                let base64Content = "";
                if (att.path) {
                    base64Content = fs.readFileSync(att.path).toString('base64');
                } else if (att.content) {
                    base64Content = Buffer.isBuffer(att.content) 
                        ? att.content.toString('base64') 
                        : Buffer.from(att.content).toString('base64');
                }
                return { content: base64Content, name: att.filename };
            }));
        }

        // Add a 10-second timeout to the fetch call to prevent hanging the whole request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': process.env.BREVO_API_KEY,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                console.error('[Email] Brevo API Error Response:', JSON.stringify(data));
                throw new Error(data.message || 'Failed to send email via Brevo API');
            }

            console.log(`[Email] Success! Message ID: ${data.messageId || data.id}`);
            return data;

        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.error('[Email] Brevo API timed out after 10 seconds.');
                throw new Error('Email service timed out. Please check your Brevo account and API key.');
            }
            console.error('[Email] Connection Error:', error.message);
            throw error;
        }
    }
};

export default transporter;