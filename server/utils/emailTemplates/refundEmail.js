import transporter from '../../config/nodemailer.js';

export const sendRefundRequestEmail = async ({ email, name, refundId, amount }) => {
    try {
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: `Refund Request Received - #${refundId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #AA8F66;">Refund Request Received</h2>
                    <p>Dear ${name},</p>
                    <p>We have received your refund request for <strong>₹${amount}</strong>.</p>
                    <p>Our team is reviewing your request. You will receive an update within 2-3 business days.</p>
                    <p><strong>Refund ID:</strong> ${refundId}</p>
                    <p>Warm Regards,<br>Lumière Luxury Hotels Team</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending refund request email:', error);
    }
};

export const sendRefundStatusEmail = async ({ email, name, refundId, status, amount, reason }) => {
    try {
        let subject = `Refund Status Update - #${refundId}`;
        let content = '';

        if (status === 'approved') {
            subject = `Refund Approved - #${refundId}`;
            content = `
                <p>We are pleased to inform you that your refund request has been <strong>APPROVED</strong> for <strong>₹${amount}</strong>.</p>
                <p>The amount will be credited to your original payment method within 5-7 business days.</p>
            `;
        } else if (status === 'rejected') {
            subject = `Refund Request Rejected - #${refundId}`;
            content = `
                <p>We regret to inform you that your refund request has been <strong>REJECTED</strong>.</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                <p>If you have any questions, please contact support.</p>
            `;
        } else if (status === 'completed') {
            subject = `Refund Processed Successfully - #${refundId}`;
            content = `
                <p>Your refund of <strong>₹${amount}</strong> has been successfully processed and credited.</p>
                <p>Please check your bank statement.</p>
            `;
        }

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #AA8F66;">Refund Status Update</h2>
                    <p>Dear ${name},</p>
                    ${content}
                    <p><strong>Refund ID:</strong> ${refundId}</p>
                    <p>Warm Regards,<br>Lumière Luxury Hotels Team</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending refund status email:', error);
    }
};
