import fs from 'fs';

/**
 * FINAL FIX: Compatibility shim to mimic nodemailer transporter using BREVO HTTP API.
 * Render.com blocks Port 587 (SMTP) on the free tier, but Port 443 (HTTPS) is always open.
 */
const transporter = {
    sendMail: async (options) => {
        const { from, to, subject, text, html, attachments } = options;
        
        // Final fallback for sender
        const senderEmail = from || process.env.SENDER_EMAIL;

        // Brevo API Payload format
        const payload = {
            sender: { email: senderEmail, name: "Lumière Luxury Hotels" },
            to: (Array.isArray(to) ? to : [to]).map(email => ({ email })),
            subject: subject,
            htmlContent: html || text,
        };
        
        // Handle attachments (e.g., for Invoices)
        if (attachments && attachments.length > 0) {
            payload.attachment = await Promise.all(attachments.map(async (att) => {
                let base64Content = "";
                if (att.path) {
                    base64Content = fs.readFileSync(att.path).toString('base64');
                } else if (att.content) {
                    // If content is already a Buffer or string
                    base64Content = Buffer.isBuffer(att.content) 
                        ? att.content.toString('base64') 
                        : Buffer.from(att.content).toString('base64');
                }
                return { content: base64Content, name: att.filename };
            }));
        }

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Brevo API Failure:', data);
            throw new Error(data.message || 'Failed to send email via Brevo API');
        }

        return data;
    }
};

export default transporter;