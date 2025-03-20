const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    date: Date,
    type: {
        type: String,
        enum: ['routine', 'repair', 'inspection']
    },
    description: String,
    cost: Number,
    nextMaintenanceDate: Date,
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'pending'],
        default: 'scheduled'
    }
});

const equipmentSchema = new mongoose.Schema({
    equipmentId: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: ['crane', 'truck', 'equipment']
    },
    model: String,
    capacity: String,
    licensePlate: String,
    purchaseDate: Date,
    registrationExpiry: Date,
    insuranceExpiry: Date,
    status: {
        type: String,
        enum: ['available', 'in-use', 'maintenance', 'retired'],
        default: 'available'
    },
    maintenanceHistory: [maintenanceSchema],
    currentLocation: String,
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);