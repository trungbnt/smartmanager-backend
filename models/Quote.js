const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    quoteNumber: {
        type: String,
        required: true,
        unique: true
    },
    jobRequestId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
        default: 'draft'
    },
    fileUrl: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date
    }
});

module.exports = mongoose.model('Quote', quoteSchema);