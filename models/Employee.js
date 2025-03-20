const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true,
        enum: ['sales', 'technical', 'accounting', 'management']
    },
    position: String,
    phone: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    salary: Number,
    commission: Number,
    joinDate: Date,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);