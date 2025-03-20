const mongoose = require('mongoose');

const jobRequestSchema = new mongoose.Schema({
    requestId: {
        type: String,
        required: true,
        unique: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add pre-save middleware to ensure customer info is populated
jobRequestSchema.pre('save', async function(next) {
    try {
        if (this.isNew || this.isModified('customerId')) {
            const Customer = mongoose.model('Customer');
            const customer = await Customer.findById(this.customerId);
            if (customer) {
                this.customerName = customer.name;
                this.customerEmail = customer.email;
                this.customerPhone = customer.phone;
            }
        }
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('JobRequest', jobRequestSchema);