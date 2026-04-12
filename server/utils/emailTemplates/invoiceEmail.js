import transporter from '../../config/nodemailer.js';
import path from 'path';
import { formatExactTime } from '../formatDate.js';

export const sendInvoiceEmail = async (invoice) => {
    try {
        const mailOptions = {
            from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
            to: invoice.customerDetails.email,
            subject: `Invoice #${invoice.invoiceNumber} from Lumière Luxury Hotels`,
            html: `
                <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #1A1A1A; padding: 30px; text-align: center;">
                        <h1 style="color: #D4AF37; margin: 0; font-size: 24px; text-transform: uppercase;">Lumière</h1>
                        <p style="color: #ffffff; font-size: 10px; margin-top: 5px; letter-spacing: 2px;">INVOICE</p>
                    </div>
                    <div style="padding: 40px 30px; color: #333333; line-height: 1.7;">
                        <h2 style="color: #1A1A1A; margin-top: 0; font-size: 20px;">Dear ${invoice.customerDetails.name},</h2>
                        <p>Thank you for choosing Lumière Luxury Hotels. Please find your detailed invoice attached to this email for your recent stay.</p>
                        
                        <div style="background-color: #F8F5F0; padding: 25px; border-radius: 6px; margin: 30px 0; border-left: 4px solid #D4AF37;">
                            <table style="width: 100%; font-size: 15px;">
                                <tr><td style="padding: 5px 0; color: #666;">Invoice Number:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${invoice.invoiceNumber}</td></tr>
                                <tr><td style="padding: 5px 0; color: #666;">Booking Reference:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${invoice.bookingId}</td></tr>
                                <tr><td style="padding: 5px 0; color: #666;">Generated at:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${formatExactTime(invoice.createdAt || new Date())}</td></tr>
                                <tr><td style="padding: 15px 0 0; font-size: 18px; color: #1A1A1A; border-top: 1px solid #EEE;">Total Amount:</td><td style="padding: 15px 0 0; font-weight: bold; text-align: right; color: #D4AF37; font-size: 18px; border-top: 1px solid #EEE;">₹${invoice.grandTotal.toFixed(2)}</td></tr>
                                <tr><td style="padding: 5px 0; color: #666;">Payment Status:</td><td style="padding: 5px 0; text-align: right;"><span style="color: ${invoice.paymentStatus === 'paid' ? '#4CAF50' : '#FF9800'}; font-weight: bold; text-transform: uppercase;">${invoice.paymentStatus}</span></td></tr>
                            </table>
                        </div>

                        ${invoice.paymentStatus !== 'paid' ? `<p style="padding: 15px; background-color: #FFF3E0; border-radius: 4px; color: #E65100; font-size: 14px;"><strong>Payment Notice:</strong> Please ensure payment is finalized to maintain your reservation status.</p>` : `<p style="text-align: center; color: #4CAF50; font-weight: bold;">Thank you for your prompt payment.</p>`}
                        
                        <p style="margin-top: 40px; text-align: center;">We look forward to welcoming you back to our sanctuary of luxury.</p>
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="font-weight: bold; font-family: cursive; color: #D4AF37;">The Lumière Team</p>
                        </div>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: `${invoice.invoiceNumber}.pdf`,
                    path: path.join(process.cwd(), 'server', 'public', invoice.pdfUrl)
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        console.log(`Invoice email sent to ${invoice.customerDetails.email}`);
        return true;
    } catch (error) {
        console.error('Error sending invoice email:', error);
        return false;
    }
};
