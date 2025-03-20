const Report = require('../models/Report');

// Tạo báo cáo mới
exports.createReport = async (req, res) => {
    try {
        const { month, year, totalRevenue, totalExpenses, totalJobs } = req.body;
        const report = new Report({ month, year, totalRevenue, totalExpenses, totalJobs });
        await report.save();
        res.status(201).send(report);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Lấy danh sách báo cáo
exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Không thể tải danh sách báo cáo' });
    }
};

// Thêm báo cáo mới
exports.addReport = async (req, res) => {
    try {
        const { title, content, type, startDate, endDate } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!title || !type || !startDate || !endDate) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }

        // Kiểm tra ngày hợp lệ
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Ngày không hợp lệ' });
        }

        if (start > end) {
            return res.status(400).json({ message: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc' });
        }

        const newReport = new Report({
            title,
            content,
            type,
            startDate: start,
            endDate: end,
            createdBy: req.user._id // Lấy từ middleware auth
        });

        await newReport.save();
        res.status(201).json(newReport);
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(400).json({ message: 'Không thể tạo báo cáo', error: error.message });
    }
};

// Cập nhật báo cáo
exports.updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, type, startDate, endDate } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!title || !type || !startDate || !endDate) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }

        // Kiểm tra ngày hợp lệ
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Ngày không hợp lệ' });
        }

        if (start > end) {
            return res.status(400).json({ message: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc' });
        }

        const updatedReport = await Report.findByIdAndUpdate(
            id,
            {
                title,
                content,
                type,
                startDate: start,
                endDate: end
            },
            { new: true, runValidators: true }
        );

        if (!updatedReport) {
            return res.status(404).json({ message: 'Không tìm thấy báo cáo' });
        }

        res.json(updatedReport);
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(400).json({ message: 'Không thể cập nhật báo cáo', error: error.message });
    }
};

// Xóa báo cáo
exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReport = await Report.findByIdAndDelete(id);

        if (!deletedReport) {
            return res.status(404).json({ message: 'Không tìm thấy báo cáo' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(400).json({ message: 'Không thể xóa báo cáo', error: error.message });
    }
}; 