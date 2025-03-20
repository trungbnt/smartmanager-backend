const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (roles = []) => {
// const auth = () => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: 'Authorization header is missing' });
            }

            // Xử lý token linh hoạt
            // let token = authHeader;
            // if (authHeader.startsWith('Bearer Bearer ')) {
            //     token = authHeader.replace(/^Bearer\s+Bearer\s+/, '').trim();
            // } else if (authHeader.startsWith('Bearer ')) {
            //     token = authHeader.replace(/^Bearer\s+/, '').trim();
            // }
            const token = authHeader.replace('Bearer ', '').trim();

            if (!token || token === 'undefined' || token === 'null') {
                return res.status(401).json({ message: 'Valid token not provided' });
            }

            if (!process.env.JWT_SECRET) {
                return res.status(500).json({ message: 'Server configuration error' });
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log('Decoded token:', decoded);
                if (decoded.role && decoded.role.toLowerCase() === 'admin') {
                    req.user = decoded;
                    return next();
                }
                if (roles.length && !roles.includes(decoded.role?.toLowerCase())) {
                    console.log('Access denied - User role not in allowed roles');
                    return res.status(403).json({ message: 'Access denied - Insufficient privileges' });
                }
                req.user = decoded;
                console.log('Middleware auth - Success');
                next();
            } catch (jwtError) {
                console.error('JWT verification failed:', jwtError.message);
                return res.status(401).json({ message: 'Invalid token format or signature' });
            }
            // try {
            //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
            //     req.user = decoded; // Gán thông tin người dùng (ví dụ: _id, role) vào req.user
            //     next();
            // } catch (jwtError) {
            //     return res.status(401).json({ message: 'Invalid token format or signature' });
            // }
        } catch (error) {
            res.status(500).json({ message: 'Internal server error during authentication' });
        }
    };
};

module.exports = auth;