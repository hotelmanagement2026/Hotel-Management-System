import transporter from '../../config/nodemailer.js';
import path from 'path';

export const sendInvoiceEmail = async (invoice) => {
    try {
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: invoice.customerDetails.email,
            subject: `Invoice #${invoice.invoiceNumber} from Lumière Luxury Hotels`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #AA8F66;">Lumière Luxury Hotels</h2>
                    <p>Dear ${invoice.customerDetails.name},</p>
                    <p>Thank you for choosing Lumière Luxury Hotels. Please find attached your invoice for your recent booking.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
                        <p><strong>Booking ID:</strong> ${invoice.bookingId}</p>
                        <p><strong>Total Amount:</strong> ₹${invoice.grandTotal.toFixed(2)}</p>
                        <p><strong>Status:</strong> <span style="color: ${invoice.paymentStatus === 'paid' ? 'green' : 'orange'}; font-weight: bold;">${invoice.paymentStatus.toUpperCase()}</span></p>
                    </div>

                    ${invoice.paymentStatus !== 'paid' ? `<p>Please ensure payment is made by the due date to avoid any inconvenience.</p>` : `<p>We appreciate your prompt payment.</p>`}
                    
                    <p>If you have any questions, please contact our support team.</p>
                    <p>Warm Regards,<br>Lumière Luxury Hotels Team</p>
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
