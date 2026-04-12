import cron from 'node-cron';
import Transaction from '../models/Transaction.js';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

const sendCheckInReminder = async (booking, user) => {
    try {
        const mailOptions = {
            from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
            to: user.email,
            subject: 'Your Upcoming Stay at Lumière Luxury Hotels',
            html: `
                <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <div style="background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%); padding: 40px 20px; text-align: center;">
                        <h1 style="color: #D4AF37; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">Lumière</h1>
                    </div>
                    <div style="padding: 40px 30px; color: #333333; line-height: 1.7;">
                        <h2 style="color: #1A1A1A; margin-top: 0; font-size: 22px; text-align: center;">Your Sanctuary Awaits</h2>
                        <p>Dear <strong>${user.name}</strong>,</p>
                        <p>We are delighted to count down the hours until your arrival. This is a friendly reminder that your stay at <strong>Lumière Luxury Hotels</strong> begins tomorrow.</p>
                        
                        <div style="background-color: #F8F5F0; padding: 25px; border-radius: 6px; margin: 30px 0; border-left: 4px solid #D4AF37;">
                            <h3 style="margin-top: 0; color: #1A1A1A; font-size: 18px; border-bottom: 1px solid #E0E0E0; padding-bottom: 10px;">Check-in Details</h3>
                            <table style="width: 100%; font-size: 15px;">
                                <tr><td style="padding: 8px 0; color: #666;">Booking ID:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${booking.bookingId}</td></tr>
                                <tr><td style="padding: 8px 0; color: #666;">Room Type:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${booking.roomName}</td></tr>
                                <tr><td style="padding: 8px 0; color: #666;">Arrival Date:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${new Date(booking.checkIn).toLocaleDateString(undefined, { dateStyle: 'long' })}</td></tr>
                            </table>
                        </div>

                        <p style="text-align: center;">If you have any special requirements for your arrival, please let us know.</p>
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
