import { Resend } from 'resend';
import fs from 'fs';

// Initialize Resend with API Key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Compatibility wrapper to mimic nodemailer transporter
 * This avoids refactoring every single call site in the controllers.
 */
const transporter = {
    sendMail: async (options) => {
        const { from, to, subject, text, html, attachments } = options;
        
        // Final fallback for 'from' address. 
        // Resend requires a verified domain or 'onboarding@resend.dev' for testing.
        const fromAddress = from || process.env.SENDER_EMAIL || 'onboarding@resend.dev';

        const resendOptions = {
            from: fromAddress,
            to: Array.isArray(to) ? to : [to],
            subject,
            text,
            html: html || text,
        };

        // Handle attachments if present (e.g., for Invoices)
        if (attachments && attachments.length > 0) {
            resendOptions.attachments = await Promise.all(attachments.map(async (att) => {
                const attachment = { filename: att.filename };
                if (att.path) {
                    // Resend expects content as Buffer or string for attachments
                    attachment.content = fs.readFileSync(att.path);
                } else if (att.content) {
                    attachment.content = att.content;
                }
                return attachment;
            }));
        }

        const { data, error } = await resend.emails.send(resendOptions);

        if (error) {
            console.error('Resend Error:', error);
            throw new Error(error.message);
        }

        return data;
    }
};

export default transporter;