import userModel from "../models/userModel.js";

const adminAuth = async (req, res, next) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: 'Not authorized. User ID missing.' });
        }

        const user = await userModel.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
        }

        next();
    } catch (error) {
        console.error('Admin Auth Error:', error);
        return res.status(500).json({ success: false, message: 'Server error during admin authentication.' });
    }
};

export default adminAuth;
