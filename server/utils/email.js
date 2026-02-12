import transporter from '../config/nodemailer.js';

export const sendBookingConfirmation = async ({ email, name, bookingId, roomName, checkIn, checkOut, amount, currency }) => {
    try {
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Booking Confirmed - Lumiere Luxury Hotels',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #D4AF37; text-align: center;">Booking Confirmed</h2>
                    <p>Dear ${name},</p>
                    <p>Thank you for choosing Lumiere Luxury Hotels. We are pleased to confirm your reservation.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">Reservation Details</h3>
                        <p><strong>Booking ID:</strong> ${bookingId}</p>
                        <p><strong>Room:</strong> ${roomName}</p>
                        <p><strong>Check-in:</strong> ${new Date(checkIn).toLocaleDateString()}</p>
                        <p><strong>Check-out:</strong> ${new Date(checkOut).toLocaleDateString()}</p>
                        <p><strong>Total Amount:</strong> ${amount} ${currency}</p>
                    </div>

                    <p>We look forward to hosting you.</p>
                    <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">
                        &copy; ${new Date().getFullYear()} Lumiere Luxury Hotels. All rights reserved.
                    </p>
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
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Upcoming Check-in Reminder - Lumiere Luxury Hotels',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #D4AF37; text-align: center;">Upcoming Stay Reminder</h2>
                    <p>Dear ${name},</p>
                    <p>This is a friendly reminder that you have an upcoming stay at Lumiere Luxury Hotels starting tomorrow.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">Reservation Details</h3>
                        <p><strong>Booking ID:</strong> ${bookingId}</p>
                        <p><strong>Room:</strong> ${roomName}</p>
                        <p><strong>Check-in:</strong> ${new Date(checkIn).toLocaleDateString()}</p>
                    </div>

                    <p>We are excited to welcome you!</p>
                    <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">
                        &copy; ${new Date().getFullYear()} Lumiere Luxury Hotels. All rights reserved.
                    </p>
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
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Booking Cancellation - Lumiere Luxury Hotels',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #D4AF37; text-align: center;">Booking Cancelled</h2>
                    <p>Dear ${name},</p>
                    <p>Your booking has been successfully cancelled as requested.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">Cancellation Details</h3>
                        <p><strong>Booking ID:</strong> ${bookingId}</p>
                        <p><strong>Room:</strong> ${roomName}</p>
                        ${refundAmount ? `<p><strong>Refund Amount:</strong> ${refundAmount} INR (Process initiated)</p>` : ''}
                    </div>

                    <p>We hope to welcome you in the future.</p>
                    <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">
                        &copy; ${new Date().getFullYear()} Lumiere Luxury Hotels. All rights reserved.
                    </p>
                </div>
            `,
        };

        // Email to Admin/Hotel Staff
        const adminMailOptions = {
            from: process.env.SENDER_EMAIL,
            to: process.env.SENDER_EMAIL, // Sending to self/admin
            subject: `ACTION REQUIRED: Booking Cancelled - ${bookingId}`,
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>Booking Cancellation Alert</h2>
                    <p>A booking has been cancelled.</p>
                    <ul>
                        <li><strong>Booking ID:</strong> ${bookingId}</li>
                        <li><strong>Guest:</strong> ${name} (${email})</li>
                        <li><strong>Room:</strong> ${roomName}</li>
                        <li><strong>Action:</strong> Room is now available for reallocation.</li>
                    </ul>
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
