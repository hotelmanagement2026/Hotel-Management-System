import transporter from '../../config/nodemailer.js';
import { formatExactTime } from '../formatDate.js';

export const sendRefundRequestEmail = async ({ email, name, refundId, amount }) => {
    try {
        const mailOptions = {
            from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: `Refund Request Received - #${refundId}`,
            html: `
                <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #1A1A1A; padding: 30px; text-align: center;">
                        <h1 style="color: #D4AF37; margin: 0; font-size: 24px; text-transform: uppercase;">Lumière</h1>
                    </div>
                    <div style="padding: 40px 30px; color: #333333; line-height: 1.7;">
                        <h2 style="color: #1A1A1A; margin-top: 0; font-size: 20px;">Refund Request Received</h2>
                        <p>Dear <strong>${name}</strong>,</p>
                        <p>We wish to acknowledge the receipt of your refund request. Our finance team is currently reviewing the details.</p>
                        
                        <div style="background-color: #F8F5F0; padding: 25px; border-radius: 6px; margin: 30px 0; border-left: 4px solid #D4AF37;">
                            <p style="margin: 0; font-size: 15px;"><strong>Refund ID:</strong> ${refundId}</p>
                            <p style="margin: 10px 0 0; font-size: 15px;"><strong>Amount:</strong> ₹${amount}</p>
                            <p style="margin: 10px 0 0; font-size: 13px; color: #666;">Requested at: ${formatExactTime(new Date())}</p>
                        </div>

                        <p>You can expect a status update within 2-3 business days. Thank you for your patience.</p>
                        <p style="margin-top: 40px; font-weight: bold; font-family: cursive; color: #D4AF37;">The Lumière Team</p>
                    </div>
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
            from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: subject,
            html: `
                <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #1A1A1A; padding: 30px; text-align: center;">
                        <h1 style="color: #D4AF37; margin: 0; font-size: 24px; text-transform: uppercase;">Lumière</h1>
                    </div>
                    <div style="padding: 40px 30px; color: #333333; line-height: 1.7;">
                        <h2 style="color: #1A1A1A; margin-top: 0; font-size: 20px;">Refund Status Update</h2>
                        <p>Dear <strong>${name}</strong>,</p>
                        ${content}
                        <div style="background-color: #F8F5F0; padding: 20px; border-radius: 6px; margin: 25px 0;">
                            <p style="margin: 0; font-size: 14px; color: #666;">Refund Reference: ${refundId}</p>
                            <p style="margin: 5px 0 0; font-size: 12px; color: #999;">Updated at: ${formatExactTime(new Date())}</p>
                        </div>
                        <p style="margin-top: 40px; font-weight: bold; font-family: cursive; color: #D4AF37;">The Lumière Team</p>
                    </div>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending refund status email:', error);
    }
};
