import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

const buildUserData = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAccountVerified: user.isAccountVerified,
    role: user.role
});

const setAuthCookie = (res, token) => {
    // If FRONTEND_URL is set, we are in a deployed cross-origin environment.
    const isDeployed = process.env.NODE_ENV === 'production' || !!process.env.FRONTEND_URL;
    res.cookie('token', token, {
        httpOnly: true,
        secure: isDeployed, // Must be true for SameSite=none
        sameSite: isDeployed ? 'none' : 'strict',
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
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Lumiere Luxury Hotels',
            text: `${user.name}, your Lumiere Luxury Hotels account has been created for ${email}.`,
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.warn('Email send failed:', emailError.message);
        }

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
        const isDeployed = process.env.NODE_ENV === 'production' || !!process.env.FRONTEND_URL;
        res.clearCookie('token', {
            httpOnly: true,
            secure: isDeployed,
            sameSite: isDeployed ? 'none' : 'strict',
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
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Verify your Lumiere account',
            text: `Your verification code is ${otp}. It expires in 10 minutes.`,
        };

        await transporter.sendMail(mailOptions);

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
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Reset your Lumiere password',
            text: `Your password reset code is ${otp}. It expires in 10 minutes.`,
        };

        await transporter.sendMail(mailOptions);

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
