const JobRequest = require('../models/JobRequest');

// Tạo yêu cầu công việc mới
const createJobRequest = async (req, res) => {
    try {
        // Lấy tất cả dữ liệu từ request body
        const { title, description, requestId, customerId, customerName, customerEmail, customerPhone } = req.body;
        
        // Tạo đối tượng JobRequest mới với đầy đủ thông tin
        const newJobRequest = new JobRequest({
            title,
            description,
            requestId,
            customerId,
            customerName,
            customerEmail,
            customerPhone,
            status: 'pending'
        });
        
        // Lưu vào database
        await newJobRequest.save();
        
        // Trả về response với đầy đủ thông tin
        res.status(201).json(newJobRequest);
    } catch (error) {
        res.status(400).json({ message: 'Error adding job request', error: error.message });
    }
};

// Lấy danh sách yêu cầu công việc
const getJobRequests = async (req, res) => {
    try {
        const jobRequests = await JobRequest.find();
        res.json(jobRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job requests' });
    }
};

// Thêm yêu cầu công việc
const addJobRequest = async (req, res) => {
    try {
        const { title, description, requestId, customerId, customerName, customerEmail, customerPhone } = req.body;
        
        // Tạo đối tượng JobRequest mới với đầy đủ thông tin
        const newJobRequest = new JobRequest({
            title,
            description,
            requestId,
            customerId,
            customerName,
            customerEmail,
            customerPhone,
            status: 'pending'
        });
        
        // Lưu vào database
        await newJobRequest.save();
        
        // Trả về response với đầy đủ thông tin
        res.status(201).json(newJobRequest);
    } catch (error) {
        res.status(400).json({ message: 'Error adding job request', error: error.message });
    }
};

// Cập nhật yêu cầu công việc
const updateJobRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, customerId, customerName, customerEmail, customerPhone } = req.body;
        
        const jobRequest = await JobRequest.findById(id);
        
        if (!jobRequest) {
            return res.status(404).json({ message: 'Không tìm thấy yêu cầu công việc' });
        }

        // Kiểm tra quyền cập nhật
        const userRole = req.user.role;
        if (userRole !== 'admin' && userRole !== 'account' && req.user.id !== jobRequest.customerId.toString()) {
            return res.status(403).json({ message: 'Không có quyền cập nhật' });
        }

        // Cập nhật thông tin
        jobRequest.title = title;
        jobRequest.description = description;
        jobRequest.status = status;
        jobRequest.customerId = customerId;
        jobRequest.customerName = customerName;
        jobRequest.customerEmail = customerEmail;
        jobRequest.customerPhone = customerPhone;

        await jobRequest.save();
        res.json(jobRequest);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Xóa yêu cầu công việc
const deleteJobRequest = async (req, res) => {
    const { id } = req.params;
    try {
        await JobRequest.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: 'Error deleting job request' });
    }
};

// Export all functions
module.exports = {
    createJobRequest,
    getJobRequests,
    addJobRequest,
    updateJobRequest,
    deleteJobRequest
};