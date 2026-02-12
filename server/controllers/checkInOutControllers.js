import Transaction from '../models/Transaction.js';
import Room from '../models/Room.js';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

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
                    from: process.env.SENDER_EMAIL,
                    to: userEmail,
                    subject: 'Welcome to Lumière Luxury Hotels',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #d4af37; padding: 30px; text-align: center; }
                                .content { background: #f9f9f9; padding: 30px; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                                .highlight { color: #d4af37; font-weight: bold; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>Welcome to Lumière Luxury Hotels</h1>
                                </div>
                                <div class="content">
                                    <h2>Check-In Confirmation</h2>
                                    <p>Dear ${userName},</p>
                                    <p>We are delighted to welcome you to Lumière Luxury Hotels!</p>
                                    
                                    <h3>Your Booking Details:</h3>
                                    <p><strong>Room:</strong> ${booking.roomName}</p>
                                    <p><strong>Check-In:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
                                    <p><strong>Check-Out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
                                    <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                                    
                                    <p>Your room is ready and waiting for you. Our team is here to ensure your stay is exceptional.</p>
                                    
                                    <p>If you need anything during your stay, please don't hesitate to contact our front desk.</p>
                                    
                                    <p>Enjoy your stay!</p>
                                    
                                    <p class="highlight">The Lumière Team</p>
                                </div>
                                <div class="footer">
                                    <p>Lumière Luxury Hotels | Experience Refined Elegance</p>
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

        // Set room as available
        if (booking.roomId) {
            try {
                await Room.findByIdAndUpdate(booking.roomId, { isAvailable: true });
            } catch (roomError) {
                console.error('Failed to update room availability:', roomError);
            }
        }

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
                    from: process.env.SENDER_EMAIL,
                    to: userEmail,
                    subject: 'Thank You for Staying With Us',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #d4af37; padding: 30px; text-align: center; }
                                .content { background: #f9f9f9; padding: 30px; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                                .highlight { color: #d4af37; font-weight: bold; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>Thank You for Staying With Us</h1>
                                </div>
                                <div class="content">
                                    <h2>Check-Out Confirmation</h2>
                                    <p>Dear ${userName},</p>
                                    <p>Thank you for choosing Lumière Luxury Hotels. We hope you had a wonderful stay!</p>
                                    
                                    <h3>Your Stay Summary:</h3>
                                    <p><strong>Room:</strong> ${booking.roomName}</p>
                                    <p><strong>Check-In:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
                                    <p><strong>Check-Out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
                                    <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                                    
                                    <p>We would love to hear about your experience. Your feedback helps us continue to provide exceptional service.</p>
                                    
                                    <p>We look forward to welcoming you back soon!</p>
                                    
                                    <p class="highlight">Safe travels,<br>The Lumière Team</p>
                                </div>
                                <div class="footer">
                                    <p>Lumière Luxury Hotels | Experience Refined Elegance</p>
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
