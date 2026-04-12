import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import { formatExactTime } from '../utils/formatDate.js';

const buildUserData = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAccountVerified: user.isAccountVerified,
    role: user.role
});

const setAuthCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

// Register controller
export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing details' });
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({ name, email, password: hashedPassword });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        setAuthCookie(res, token);

        const mailOptions = {
            from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: 'Welcome to Lumière Luxury Hotels',
            html: `
                <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <div style="background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%); padding: 40px 20px; text-align: center;">
                        <h1 style="color: #D4AF37; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">Lumière</h1>
                        <p style="color: #FFFFFF; margin: 10px 0 0; font-size: 14px; opacity: 0.8; letter-spacing: 1px;">Luxury Hotels</p>
                    </div>
                    <div style="padding: 40px 30px; color: #333333; line-height: 1.7; text-align: center;">
                        <h2 style="color: #1A1A1A; margin-top: 0; font-size: 22px;">Welcome, ${user.name}</h2>
                        <p>We are honored to have you join our exclusive community. Your account at <strong>Lumière Luxury Hotels</strong> has been successfully created.</p>
                        <p>Explore a world of refined elegance, bespoke services, and unforgettable stays.</p>
                        <div style="margin-top: 30px; padding: 20px; border-top: 1px solid #EEE;">
                            <p style="font-size: 14px; color: #666; margin: 0;">Account Email: <strong>${email}</strong></p>
                            <p style="font-size: 12px; color: #999; margin: 5px 0 0;">Registered on: ${formatExactTime(user.createdAt || new Date())}</p>
                        </div>
                        <p style="margin-top: 40px; font-weight: bold; font-family: cursive; font-size: 18px; color: #D4AF37;">The Lumière Team</p>
                    </div>
                </div>
            `,
        };

        // Send welcome email in background (non-blocking - don't await)
        transporter.sendMail(mailOptions).catch(emailError => {
            console.warn('Welcome email failed:', emailError.message);
        });

        return res.json({
            success: true,
            message: 'User registered successfully',
            userData: buildUserData(user),
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Login controller
export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ success: false, message: 'Email and password are required' });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        setAuthCookie(res, token);

        return res.json({
            success: true,
            message: 'Login successful',
            userData: buildUserData(user),
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Logout controller
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({ success: true, message: 'Logout successful' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Send email verification OTP
export const sendVerifyOtp = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (user.isAccountVerified) {
            return res.json({ success: false, message: 'Account already verified' });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        const mailOptions = {
            from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
            to: user.email,
            subject: 'Verify your Lumière Account',
            html: `
                <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #1A1A1A; padding: 30px; text-align: center;">
                        <h1 style="color: #D4AF37; margin: 0; font-size: 24px; text-transform: uppercase;">Lumière</h1>
                    </div>
                    <div style="padding: 40px 30px; color: #333333; line-height: 1.7; text-align: center;">
                        <h2 style="color: #1A1A1A; margin-top: 0; font-size: 20px;">Email Verification</h2>
                        <p>Please use the following security code to verify your account. This code will expire in <span style="font-weight: bold; color: #F44336;">10 minutes</span>.</p>
                        <div style="margin: 35px 0; background-color: #F8F5F0; padding: 25px; border-radius: 6px; border: 1px dashed #D4AF37;">
                            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1A1A1A;">${otp}</span>
                        </div>
                        <p style="font-size: 11px; color: #999; margin-top: 10px;">Requested at: ${formatExactTime(new Date())}</p>
                        <p style="font-size: 13px; color: #888;">If you did not request this verification, please ignore this email or contact support.</p>
                    </div>
                </div>
            `,
        };

        // Save OTP first, then send email in background (non-blocking)
        transporter.sendMail(mailOptions).catch(e => console.warn('Verify OTP email failed:', e.message));

        return res.json({ success: true, message: 'Verification code sent to your email' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Verify email
export const verifyEmail = async (req, res) => {
    const userId = req.userId;
    const { otp } = req.body;

    if (!userId || !otp) {
        return res.json({ success: false, message: 'Missing details' });
    }

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const storedOtp = String(user.verifyOtp || '').trim();
        const receivedOtp = String(otp).trim();

        if (!storedOtp || storedOtp !== receivedOtp) {
            return res.json({ success: false, message: 'Invalid verification code' });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'Verification code expired' });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();

        return res.json({
            success: true,
            message: 'Email verified successfully',
            userData: buildUserData(user),
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Auth check
export const isAuthenticated = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        return res.json({ success: true, userData: buildUserData(user) });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Send password reset OTP
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: 'Email is required' });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        const mailOptions = {
            from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
            to: user.email,
            subject: 'Reset your Lumière Password',
            html: `
                <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #1A1A1A; padding: 30px; text-align: center;">
                        <h1 style="color: #D4AF37; margin: 0; font-size: 24px; text-transform: uppercase;">Lumière</h1>
                    </div>
                    <div style="padding: 40px 30px; color: #333333; line-height: 1.7; text-align: center;">
                        <h2 style="color: #1A1A1A; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
                        <p>We received a request to reset your password. Use the code below to proceed. This code is valid for <span style="font-weight: bold; color: #F44336;">10 minutes</span>.</p>
                        <div style="margin: 35px 0; background-color: #F8F5F0; padding: 25px; border-radius: 6px; border: 1px dashed #D4AF37;">
                            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1A1A1A;">${otp}</span>
                        </div>
                        <p style="font-size: 11px; color: #999; margin-top: 10px;">Requested at: ${formatExactTime(new Date())}</p>
                        <p style="font-size: 13px; color: #888;">If you didn't request a password reset, you can safely ignore this email.</p>
                    </div>
                </div>
            `,
        };

        // Send reset email in background (non-blocking)
        transporter.sendMail(mailOptions).catch(e => console.warn('Reset OTP email failed:', e.message));

        return res.json({ success: true, message: 'Password reset code sent to your email' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Reset user password
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: 'Email, code, and new password are required' });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const storedOtp = String(user.resetOtp || '').trim();
        const receivedOtp = String(otp).trim();

        if (!storedOtp || storedOtp !== receivedOtp) {
            return res.json({ success: false, message: 'Invalid reset code' });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'Reset code expired' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;
        await user.save();

        return res.json({ success: true, message: 'Password has been reset successfully' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
