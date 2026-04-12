import transporter from '../config/nodemailer.js';
import { formatExactTime } from './formatDate.js';

export const sendBookingConfirmation = async ({ email, name, bookingId, roomName, checkIn, checkOut, amount, currency }) => {
    try {
        const mailOptions = {
            from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: 'Booking Confirmed - Lumière Luxury Hotels',
            html: `
                <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <div style="background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%); padding: 40px 20px; text-align: center;">
                        <h1 style="color: #D4AF37; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">Lumière</h1>
                        <p style="color: #FFFFFF; margin: 10px 0 0; font-size: 14px; opacity: 0.8; letter-spacing: 1px;">Luxury Hotels</p>
                    </div>
                    <div style="padding: 40px 30px; color: #333333; line-height: 1.7;">
                        <h2 style="color: #1A1A1A; margin-top: 0; font-size: 22px; text-align: center;">Booking Confirmed</h2>
                        <p>Dear <strong>${name}</strong>,</p>
                        <p>Thank you for choosing Lumière Luxury Hotels. We are delighted to confirm your upcoming stay with us. Your reservation is now secured.</p>
                        
                        <div style="background-color: #F8F5F0; padding: 25px; border-radius: 6px; margin: 30px 0; border-left: 4px solid #D4AF37;">
                            <h3 style="margin-top: 0; color: #1A1A1A; font-size: 18px; border-bottom: 1px solid #E0E0E0; padding-bottom: 10px;">Reservation Summary</h3>
                            <table style="width: 100%; font-size: 15px;">
                                <tr><td style="padding: 8px 0; color: #666;">Booking ID:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${bookingId}</td></tr>
                                <tr><td style="padding: 8px 0; color: #666;">Room Type:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${roomName}</td></tr>
                                <tr><td style="padding: 8px 0; color: #666;">Check-in:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${new Date(checkIn).toLocaleDateString(undefined, { dateStyle: 'long' })}</td></tr>
                                <tr><td style="padding: 8px 0; color: #666;">Check-out:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${new Date(checkOut).toLocaleDateString(undefined, { dateStyle: 'long' })}</td></tr>
                                <tr><td style="padding: 8px 0; color: #666;">Booking Time:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${formatExactTime(new Date())}</td></tr>
                                <tr><td style="padding: 15px 0 0; font-size: 18px; color: #1A1A1A;">Total Paid:</td><td style="padding: 15px 0 0; font-weight: bold; text-align: right; color: #D4AF37; font-size: 18px;">${amount} ${currency}</td></tr>
                            </table>
                        </div>

                        <p style="text-align: center;">We look forward to providing you with an unforgettable experience.</p>
                        <div style="text-align: center; margin-top: 40px;">
                            <p style="font-weight: bold; font-family: cursive; font-size: 18px; color: #D4AF37; line-height: 1;">The Lumière Team</p>
                        </div>
                    </div>
                    <div style="background-color: #1A1A1A; padding: 25px; color: #999999; font-size: 12px; text-align: center;">
                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Lumière Luxury Hotels. All rights reserved.</p>
                        <p style="margin: 5px 0 0;">Experience Refined Elegance</p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Booking confirmation email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Failed to send booking confirmation email:', error.message);
        return false;
    }
};

export const sendCheckInReminder = async ({ email, name, bookingId, roomName, checkIn }) => {
    try {
        const mailOptions = {
            from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: 'Upcoming Stay Reminder - Lumière Luxury Hotels',
            html: `
                <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <div style="background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%); padding: 40px 20px; text-align: center;">
                        <h1 style="color: #D4AF37; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">Lumière</h1>
                        <p style="color: #FFFFFF; margin: 10px 0 0; font-size: 14px; opacity: 0.8; letter-spacing: 1px;">Luxury Hotels</p>
                    </div>
                    <div style="padding: 40px 30px; color: #333333; line-height: 1.7;">
                        <h2 style="color: #1A1A1A; margin-top: 0; font-size: 22px; text-align: center;">Upcoming Stay Reminder</h2>
                        <p>Dear <strong>${name}</strong>,</p>
                        <p>This is a friendly reminder that we are expecting you tomorrow! Our team is preparing for your arrival to ensure your stay is absolutely perfect.</p>
                        
                        <div style="background-color: #F8F5F0; padding: 25px; border-radius: 6px; margin: 30px 0; border-left: 4px solid #D4AF37;">
                            <h3 style="margin-top: 0; color: #1A1A1A; font-size: 18px; border-bottom: 1px solid #E0E0E0; padding-bottom: 10px;">Check-in Details</h3>
                            <table style="width: 100%; font-size: 15px;">
                                <tr><td style="padding: 8px 0; color: #666;">Booking ID:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${bookingId}</td></tr>
                                <tr><td style="padding: 8px 0; color: #666;">Room Type:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${roomName}</td></tr>
                                <tr><td style="padding: 8px 0; color: #666;">Check-in Date:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${new Date(checkIn).toLocaleDateString(undefined, { dateStyle: 'long' })}</td></tr>
                            </table>
                        </div>

                        <p style="text-align: center;">Safe travels, and we look forward to welcoming you soon.</p>
                        <div style="text-align: center; margin-top: 40px;">
                            <p style="font-weight: bold; font-family: cursive; font-size: 18px; color: #D4AF37; line-height: 1;">The Lumière Team</p>
                        </div>
                    </div>
                    <div style="background-color: #1A1A1A; padding: 25px; color: #999999; font-size: 12px; text-align: center;">
                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Lumière Luxury Hotels. All rights reserved.</p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Check-in reminder email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Failed to send check-in reminder email:', error.message);
        return false;
    }
};

export const sendCancellationEmail = async ({ email, name, bookingId, roomName, refundAmount }) => {
    try {
        // Email to Guest
        const guestMailOptions = {
            from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: 'Booking Cancellation - Lumière Luxury Hotels',
            html: `
                <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #1A1A1A; padding: 30px; text-align: center;">
                        <h1 style="color: #D4AF37; margin: 0; font-size: 24px; text-transform: uppercase;">Lumière</h1>
                    </div>
                    <div style="padding: 40px 30px; color: #333333; line-height: 1.7;">
                        <h2 style="color: #1A1A1A; margin-top: 0; font-size: 20px;">Booking Cancelled</h2>
                        <p>Dear <strong>${name}</strong>,</p>
                        <p>As per your request, we have successfully cancelled your reservation. We are sorry you won't be staying with us this time.</p>
                        
                        <div style="background-color: #FEEEEE; padding: 25px; border-radius: 6px; margin: 30px 0; border-left: 4px solid #F44336;">
                            <h3 style="margin-top: 0; color: #1A1A1A; font-size: 18px;">Cancellation Details</h3>
                            <table style="width: 100%; font-size: 15px;">
                                <tr><td style="padding: 8px 0; color: #666;">Booking ID:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${bookingId}</td></tr>
                                <tr><td style="padding: 8px 0; color: #666;">Room Type:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${roomName}</td></tr>
                                <tr><td style="padding: 8px 0; color: #666;">Cancellation Time:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${formatExactTime(new Date())}</td></tr>
                                ${refundAmount ? `<tr><td style="padding: 8px 0; color: #666;">Refund Amount:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #4CAF50;">${refundAmount} INR</td></tr>` : ''}
                            </table>
                        </div>

                        ${refundAmount ? `<p style="font-style: italic; color: #666;">The refund process has been initiated and should appear in your account within 5-7 business days.</p>` : ''}
                        
                        <p style="text-align: center; margin-top: 30px;">We hope to welcome you to Lumière in the future.</p>
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="font-weight: bold; font-family: cursive; color: #D4AF37;">The Lumière Team</p>
                        </div>
                    </div>
                </div>
            `,
        };

        // Email to Admin/Hotel Staff
        const adminMailOptions = {
            from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
            to: process.env.SENDER_EMAIL,
            subject: `ALERT: Booking Cancelled - ${bookingId}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #F8F5F0;">
                    <h2 style="color: #F44336; border-bottom: 2px solid #F44336; padding-bottom: 10px;">Booking Cancellation Alert</h2>
                    <p>The following booking has been cancelled and needs attention:</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Booking ID:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${bookingId}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Guest Name:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${name}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${email}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Room:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${roomName}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Action Time:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${formatExactTime(new Date())}</td></tr>
                    </table>
                    <p style="margin-top: 20px; font-weight: bold; color: #1A1A1A;">The room has been automatically released back to inventory.</p>
                </div>
            `,
        };

        await Promise.all([
            transporter.sendMail(guestMailOptions),
            transporter.sendMail(adminMailOptions)
        ]);

        console.log(`Cancellation emails sent for ${bookingId}`);
        return true;
    } catch (error) {
        console.error('Failed to send cancellation emails:', error.message);
        return false;
    }
};
