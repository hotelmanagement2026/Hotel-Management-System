import Transaction from '../models/Transaction.js';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import { formatExactTime } from '../utils/formatDate.js';

// Check-In Booking
export const checkInBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Find booking
        const booking = await Transaction.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if already checked in
        if (booking.bookingStatus === 'checked_in') {
            return res.status(400).json({
                success: false,
                message: 'Booking already checked in'
            });
        }

        // Update booking status
        booking.bookingStatus = 'checked_in';
        await booking.save();

        // Get user email
        let userEmail = '';
        let userName = 'Guest';
        if (booking.userId) {
            try {
                const user = await userModel.findById(booking.userId);
                if (user) {
                    userEmail = user.email;
                    userName = user.name || 'Guest';
                }
            } catch (err) {
                console.error('Error fetching user for email:', err.message);
            }
        }

        // Send check-in email
        if (userEmail) {
            try {
                const mailOptions = {
                    from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
                    to: userEmail,
                    subject: 'Welcome to Lumière Luxury Hotels',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                                .container { max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                                .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #d4af37; padding: 40px; text-align: center; }
                                .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; }
                                .content { background: #ffffff; padding: 40px; }
                                .details-box { background-color: #F8F5F0; padding: 25px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #D4AF37; }
                                .footer { background-color: #1a1a1a; text-align: center; padding: 25px; color: #999; font-size: 12px; }
                                .highlight { color: #d4af37; font-weight: bold; font-family: cursive; font-size: 18px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>Lumière</h1>
                                    <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.8; letter-spacing: 1px;">Luxury Hotels</p>
                                </div>
                                <div class="content">
                                    <h2 style="color: #1a1a1a; border-bottom: 1px solid #eee; padding-bottom: 10px;">Check-In Confirmation</h2>
                                    <p>Dear <strong>${userName}</strong>,</p>
                                    <p>We are absolutely delighted to welcome you to <strong>Lumière Luxury Hotels</strong>!</p>
                                    
                                    <div class="details-box">
                                        <h3 style="margin-top: 0; font-size: 16px; color: #1a1a1a;">Stay Details:</h3>
                                        <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${booking.bookingId}</p>
                                        <p style="margin: 5px 0;"><strong>Room Reference:</strong> ${booking.roomName}</p>
                                        <p style="margin: 5px 0;"><strong>Departure Date:</strong> ${new Date(booking.checkOut).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                        <p style="margin: 5px 0;"><strong>Check-In Time:</strong> ${formatExactTime(new Date())}</p>
                                    </div>
                                    
                                    <p>Your sanctuary is ready. Our dedicated team is here to ensure your experience exceeds every expectation.</p>
                                    <p>If you require anything—from private dining to concierge recommendations—simply dial '0' from your room.</p>
                                    
                                    <p style="margin-top: 30px;">Enjoy your stay with us.</p>
                                    <p class="highlight">The Lumière Team</p>
                                </div>
                                <div class="footer">
                                    <p>&copy; ${new Date().getFullYear()} Lumière Luxury Hotels | Experience Refined Elegance</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log('Check-in email sent successfully to:', userEmail);
            } catch (emailError) {
                console.error('Failed to send check-in email:', emailError);
                // Continue even if email fails
            }
        } else {
            console.log('No user email found for booking:', bookingId);
        }

        return res.status(200).json({
            success: true,
            message: 'Guest checked in successfully',
            data: booking
        });
    } catch (error) {
        console.error('Check-in error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to check in guest'
        });
    }
};

// Check-Out Booking
export const checkOutBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Find booking
        const booking = await Transaction.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if already checked out
        if (booking.bookingStatus === 'checked_out') {
            return res.status(400).json({
                success: false,
                message: 'Booking already checked out'
            });
        }

        // Update booking status
        booking.bookingStatus = 'checked_out';
        await booking.save();

        // Get user email
        let userEmail = '';
        let userName = 'Guest';
        if (booking.userId) {
            try {
                const user = await userModel.findById(booking.userId);
                if (user) {
                    userEmail = user.email;
                    userName = user.name || 'Guest';
                }
            } catch (err) {
                console.error('Error fetching user for email:', err.message);
            }
        }

        // Send check-out email
        if (userEmail) {
            try {
                const mailOptions = {
                    from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
                    to: userEmail,
                    subject: 'Thank You for Staying With Us',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                                .container { max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                                .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #d4af37; padding: 40px; text-align: center; }
                                .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; }
                                .content { background: #ffffff; padding: 40px; }
                                .details-box { background-color: #F8F5F0; padding: 25px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #D4AF37; }
                                .footer { background-color: #1a1a1a; text-align: center; padding: 25px; color: #999; font-size: 12px; }
                                .highlight { color: #d4af37; font-weight: bold; font-family: cursive; font-size: 18px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>Thank You</h1>
                                    <p style="margin: 5px 0; font-size: 12px; opacity: 0.8; letter-spacing: 1px;">It was a pleasure hosting you.</p>
                                </div>
                                <div class="content">
                                    <h2 style="color: #1a1a1a; border-bottom: 1px solid #eee; padding-bottom: 10px;">Check-Out Confirmation</h2>
                                    <p>Dear <strong>${userName}</strong>,</p>
                                    <p>Thank you for choosing <strong>Lumière Luxury Hotels</strong> for your recent stay. We hope your time with us was as exceptional as we intended.</p>
                                    
                                    <div class="details-box">
                                        <h3 style="margin-top: 0; font-size: 16px; color: #1a1a1a;">Stay Summary:</h3>
                                        <p style="margin: 5px 0;"><strong>Room:</strong> ${booking.roomName}</p>
                                        <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${booking.bookingId}</p>
                                        <p style="margin: 5px 0;"><strong>Stay Dates:</strong> ${new Date(booking.checkIn).toLocaleDateString()} - ${new Date(booking.checkOut).toLocaleDateString()}</p>
                                        <p style="margin: 5px 0;"><strong>Check-Out Time:</strong> ${formatExactTime(new Date())}</p>
                                    </div>
                                    
                                    <p>We would be deeply honored to welcome you back in the near future. Your feedback is always valued as we strive for perfection.</p>
                                    
                                    <p style="margin-top: 30px;">Until we meet again,</p>
                                    <p class="highlight">Safe travels,<br>The Lumière Team</p>
                                </div>
                                <div class="footer">
                                    <p>&copy; ${new Date().getFullYear()} Lumière Luxury Hotels | Experience Refined Elegance</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log('Check-out email sent successfully to:', userEmail);
            } catch (emailError) {
                console.error('Failed to send check-out email:', emailError);
                // Continue even if email fails
            }
        } else {
            console.log('No user email found for booking:', bookingId);
        }

        return res.status(200).json({
            success: true,
            message: 'Guest checked out successfully',
            data: booking
        });
    } catch (error) {
        console.error('Check-out error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to check out guest'
        });
    }
};
