const express = require('express');
const router = express.Router();
const JobRequest = require('../models/JobRequest');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');

// Get all job requests
router.get('/job-requests', auth, async (req, res) => {
    try {
        const jobRequests = await JobRequest.find().populate('customerId', 'name email phone');
        res.json(jobRequests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create job request
router.post('/job-requests', auth, async (req, res) => {
    try {
        const { title, description, requestId, customerId } = req.body;

        // Validate required fields
        if (!title || !description || !requestId || !customerId) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        // Find customer first
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin khách hàng' });
        }

        // Create job request with customer info
        const jobRequest = new JobRequest({
            title: title.trim(),
            description: description.trim(),
            requestId,
            customerId,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone
        });

        // Save and populate customer info
        const savedRequest = await jobRequest.save();
        
        // Verify saved data
        const finalRequest = await JobRequest.findById(savedRequest._id);
        
        console.log('Saved job request with customer info:', finalRequest);
        
        res.status(201).json(finalRequest);

    } catch (err) {
        console.error('Error creating job request:', err);
        res.status(500).json({ 
            message: 'Lỗi khi tạo yêu cầu công việc',
            error: err.message 
        });
    }
});

// Update job request
router.put('/job-requests/:id', auth, async (req, res) => {
    try {
        const { title, description, status, customerId } = req.body;

        if (!title || !description || !status || !customerId) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        // Find customer
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin khách hàng' });
        }

        const updatedRequest = await JobRequest.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                status,
                customerId,
                customerName: customer.name,
                customerEmail: customer.email,
                customerPhone: customer.phone
            },
            { new: true, runValidators: true }
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
        }

        res.json(updatedRequest);
    } catch (err) {
        console.error('Error updating job request:', err);
        res.status(500).json({ message: 'Lỗi khi cập nhật yêu cầu' });
    }
});

// Delete a job request
router.delete('/job-requests/:id', auth, async (req, res) => {
    try {
        const jobRequest = await JobRequest.findById(req.params.id);
        if (!jobRequest) {
            return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
        }
        await jobRequest.remove();
        res.json({ message: 'Yêu cầu đã được xóa' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;