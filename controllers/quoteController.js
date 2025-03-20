const Quote = require('../models/Quote');
const JobRequest = require('../models/JobRequest');

// Thêm hàm tạo mã báo giá
const generateQuoteNumber = async () => {
    try {
        // Lấy báo giá mới nhất để tạo mã tiếp theo
        const latestQuote = await Quote.findOne().sort({ createdAt: -1 });
        
        // Định dạng: BG-YYYYMMDD-XXX (XXX là số thứ tự tăng dần)
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        
        let counter = 1;
        if (latestQuote && latestQuote.quoteNumber) {
            // Nếu đã có báo giá, lấy số thứ tự từ mã báo giá cuối cùng
            const parts = latestQuote.quoteNumber.split('-');
            if (parts.length === 3) {
                const latestDate = parts[1];
                const latestCounter = parseInt(parts[2]);
                
                // Nếu cùng ngày, tăng counter
                if (latestDate === dateStr) {
                    counter = latestCounter + 1;
                }
            }
        }
        
        // Định dạng counter thành chuỗi 3 ký tự (001, 002, ...)
        const counterStr = counter.toString().padStart(3, '0');
        
        return `BG-${dateStr}-${counterStr}`;
    } catch (error) {
        console.error('Error generating quote number:', error);
        // Fallback nếu có lỗi
        return `BG-${Date.now()}`;
    }
};

// Tạo báo giá mới
exports.createQuote = async (req, res, fileUrl) => {
    try {
        const { jobRequestId, amount, details, status } = req.body;
        
        // Tạo mã báo giá tự động
        const quoteNumber = await generateQuoteNumber();
        
        const newQuote = new Quote({
            quoteNumber,
            jobRequestId,
            amount,
            details,
            status: status || 'draft',
            fileUrl: fileUrl || null // Sử dụng URL từ Cloudinary nếu có
        });
        
        await newQuote.save();
        res.status(201).json(newQuote);
    } catch (error) {
        res.status(400).json({ message: 'Error creating quote', error: error.message });
    }
};

// Lấy danh sách báo giá
exports.getQuotes = async (req, res) => {
    try {
        const quotes = await Quote.find().sort({ createdAt: -1 });
        res.json(quotes);
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({ message: 'Không thể lấy danh sách báo giá' });
    }
};

// Cập nhật báo giá
exports.updateQuote = async (req, res, fileUrl) => {
    try {
        const { id } = req.params;
        const { jobRequestId, amount, details, status, validUntil } = req.body;

        // Tìm báo giá cần cập nhật
        const quote = await Quote.findById(id);
        if (!quote) {
            return res.status(404).json({ message: 'Không tìm thấy báo giá' });
        }

        // Chuẩn bị dữ liệu cập nhật
        const updateData = {};
        
        // Chỉ cập nhật các trường được gửi lên
        if (jobRequestId) updateData.jobRequestId = jobRequestId;
        if (amount !== undefined) updateData.amount = parseFloat(amount);
        if (details) updateData.details = details;
        if (status) {
            // Kiểm tra trạng thái hợp lệ
            if (!['draft', 'sent', 'accepted', 'rejected', 'expired'].includes(status)) {
                return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
            }
            updateData.status = status;
        }
        if (validUntil) updateData.validUntil = validUntil;

        // Cập nhật fileUrl nếu có
        if (fileUrl) {
            updateData.fileUrl = fileUrl;
        }

        // Cập nhật báo giá trong database
        const updatedQuote = await Quote.findByIdAndUpdate(id, updateData, { 
            new: true,
            runValidators: true 
        });
        
        res.json(updatedQuote);
    } catch (error) {
        console.error('Error updating quote:', error);
        res.status(400).json({ 
            message: 'Không thể cập nhật báo giá',
            error: error.message 
        });
    }
};

// Xóa báo giá
exports.deleteQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const quote = await Quote.findById(id);
        
        if (!quote) {
            return res.status(404).json({ message: 'Không tìm thấy báo giá' });
        }

        // Không cần xóa file cục bộ nữa vì file được lưu trên Cloudinary
        await quote.deleteOne();
        res.json({ message: 'Xóa báo giá thành công' });
    } catch (error) {
        console.error('Error deleting quote:', error);
        res.status(400).json({ message: 'Không thể xóa báo giá' });
    }
};

// Cập nhật trạng thái báo giá
exports.updateQuoteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Kiểm tra trạng thái hợp lệ theo enum mới
        if (!['draft', 'sent', 'accepted', 'rejected', 'expired'].includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }

        const quote = await Quote.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true, runValidators: true }
        );

        if (!quote) {
            return res.status(404).json({ message: 'Không tìm thấy báo giá' });
        }

        res.json(quote);
    } catch (error) {
        console.error('Error updating quote status:', error);
        res.status(400).json({ 
            message: 'Không thể cập nhật trạng thái',
            error: error.message 
        });
    }
};