const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    jobRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobRequest',
        required: true
    },
    vehicleId: {
        type: String, // ID của xe
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed'],
        default: 'scheduled'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule; 