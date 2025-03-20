const User = require('../models/User');

exports.getProfile = async (req, res) => {
    try {
        // Kiểm tra dữ liệu từ token
        if (!req.user || !req.user.userId) {
            return res.status(400).json({ message: 'Invalid user data from token' });
        }

        // Truy vấn MongoDB với timeout
        const user = await User.findById(req.user.userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res) => {
    const { phone, currentPassword, newPassword, confirmPassword } = req.body;

    try {
        if (!req.user || !req.user.userId) { // Sửa từ req.user.id thành req.user.userId
            return res.status(400).json({ message: 'Invalid user data from token' });
        }
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Cập nhật phone nếu có
        if (phone) user.phone = phone;

        // Xử lý thay đổi mật khẩu nếu có
        if (currentPassword && newPassword && confirmPassword) {
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'New passwords do not match' });
            }
            user.password = newPassword; // Mật khẩu sẽ được mã hóa trong pre-save hook
        }

        await user.save();
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error in updateProfile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};