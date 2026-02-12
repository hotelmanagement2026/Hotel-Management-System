import userModel from '../models/userModel.js';

export const getAllUsers = async (req, res) => {
    try {
        const { role, email } = req.query;

        let query = {};

        if (role && role !== 'all') {
            query.role = role;
        }

        if (email) {
            query.email = { $regex: email, $options: 'i' };
        }

        const users = await userModel.find(query)
            .select('-password -verifyOtp -resetOtp -verifyOtpExpireAt -resetOtpExpireAt')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
};

export const changeUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const user = await userModel.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Change role error:', error);
        return res.status(500).json({ success: false, message: 'Failed to change user role' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting yourself
        if (id === req.userId) {
            return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
        }

        const user = await userModel.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
};
