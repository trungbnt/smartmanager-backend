const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'sales', 'engineering', 'account', 'customer'],
        required: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true // Cho phép nhiều người dùng không có email
    },
    phone: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error(error);
    }
};

// Generate JWT token method
userSchema.methods.generateToken = function() {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    
    return jwt.sign(
        { 
            userId: this._id,
            username: this.username,
            role: this.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

module.exports = mongoose.model('User', userSchema);