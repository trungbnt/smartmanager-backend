const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
    return (req, res, next) => {
        // Lấy token từ header
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(403).json({ message: 'No token provided' });
        }

        // Xác thực token
        jwt.verify(token, 'secret_key', (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Kiểm tra vai trò
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            // Lưu thông tin người dùng vào request
            req.user = decoded;
            next();
        });
    };
};

module.exports = authMiddleware; 