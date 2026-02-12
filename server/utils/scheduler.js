import cron from 'node-cron';
import Transaction from '../models/Transaction.js';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

const sendCheckInReminder = async (booking, user) => {
    try {
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Upcoming Check-in Reminder - Lumiere Luxury Hotels',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #D4AF37; text-align: center;">Upcoming Stay Reminder</h2>
                    <p>Dear ${user.name},</p>
                    <p>This is a friendly reminder that you have an upcoming stay at Lumiere Luxury Hotels starting tomorrow.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">Reservation Details</h3>
                        <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                        <p><strong>Room:</strong> ${booking.roomName}</p>
                        <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
                    </div>

                    <p>We are excited to welcome you!</p>
                    <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">
                        &copy; ${new Date().getFullYear()} Lumiere Luxury Hotels. All rights reserved.
                    </p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Check-in reminder email sent to ${user.email} for booking ${booking.bookingId}`);
    } catch (error) {
        console.error(`Failed to send reminder for booking ${booking.bookingId}:`, error.message);
    }
}

const initScheduler = () => {
    // Run every day at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
        console.log('Running daily check-in reminder job...');

        try {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const dayAfterTomorrow = new Date(tomorrow);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

            // Find bookings with check-in date matching tomorrow
            const upcomingBookings = await Transaction.find({
                checkIn: {
                    $gte: tomorrow,
                    $lt: dayAfterTomorrow
                },
                status: 'verified'
            });

            console.log(`Found ${upcomingBookings.length} upcoming bookings for tomorrow.`);

            for (const booking of upcomingBookings) {
                if (booking.userId) {
                    const user = await userModel.findById(booking.userId);
                    if (user) {
                        await sendCheckInReminder(booking, user);
                    }
                }
            }

        } catch (error) {
            console.error('Error in daily scheduler:', error);
        }
    });

    console.log('Scheduler initialized: Check-in reminders will run daily at 9:00 AM.');
};

export default initScheduler;
