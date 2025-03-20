const Invoice = require('../models/Invoice');
const Quote = require('../models/Quote');
const JobRequest = require('../models/JobRequest');

// Tạo hóa đơn mới
exports.createInvoice = async (req, res) => {
    try {
        const { quoteId, amount } = req.body;
        const invoice = new Invoice({ quoteId, amount });
        await invoice.save();
        res.status(201).send(invoice);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Lấy danh sách hóa đơn
exports.getInvoices = async (req, res) => {
    try {
        // Kiểm tra và cập nhật trạng thái quá hạn
        await checkAndUpdateOverdueStatus();
        
        // Lấy danh sách hóa đơn đã được cập nhật
        const invoices = await Invoice.find();
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoices' });
    }
};

// Thêm hóa đơn
exports.addInvoice = async (req, res) => {
    try {
        const { quoteId, amount, dueDate, customerId } = req.body;
        
        // Kiểm tra dữ liệu đầu vào
        if (!quoteId || !amount) {
            return res.status(400).json({ message: 'Thiếu thông tin báo giá hoặc số tiền' });
        }
        
        // Tạo mã hóa đơn tự động
        const invoiceNumber = await generateInvoiceNumber();
        
        // Tìm thông tin báo giá để lấy thông tin khách hàng nếu chưa có
        let finalCustomerId = customerId;
        if (!finalCustomerId) {
            const quote = await Quote.findById(quoteId);
            if (quote) {
                const jobRequest = await JobRequest.findOne({ requestId: quote.jobRequestId });
                if (jobRequest) {
                    finalCustomerId = jobRequest.customerId;
                }
            }
        }
        
        // Xử lý dueDate và kiểm tra trạng thái quá hạn
        let parsedDueDate = null;
        let initialStatus = 'pending';
        
        if (dueDate) {
            try {
                parsedDueDate = new Date(dueDate);
                
                // Kiểm tra xem ngày có hợp lệ không
                if (isNaN(parsedDueDate.getTime())) {
                    return res.status(400).json({ message: 'Định dạng ngày không hợp lệ' });
                }
                
                // Kiểm tra nếu hạn thanh toán < ngày hiện tại
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (parsedDueDate < today) {
                    initialStatus = 'overdue';
                }
            } catch (error) {
                return res.status(400).json({ message: 'Định dạng ngày không hợp lệ' });
            }
        }
        
        const invoiceData = {
            invoiceNumber,
            quoteId,
            amount,
            dueDate: parsedDueDate,
            customerId: finalCustomerId,
            status: initialStatus
        };
        
        const newInvoice = new Invoice(invoiceData);
        const savedInvoice = await newInvoice.save();
        
        res.status(201).json(savedInvoice);
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(400).json({ message: 'Không thể tạo hóa đơn', error: error.message });
    }
};

// Cập nhật hóa đơn
exports.updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, dueDate } = req.body;
        
        // Chuẩn bị dữ liệu cập nhật
        const updateData = {};
        
        // Chỉ cập nhật các trường được gửi lên
        if (status) {
            // Kiểm tra trạng thái hợp lệ
            if (!['pending', 'paid', 'overdue', 'cancelled'].includes(status)) {
                return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
            }
            updateData.status = status;
        }
        
        if (dueDate) {
            try {
                const parsedDueDate = new Date(dueDate);
                // Kiểm tra xem ngày có hợp lệ không
                if (isNaN(parsedDueDate.getTime())) {
                    return res.status(400).json({ message: 'Định dạng ngày không hợp lệ' });
                }
                
                // Kiểm tra nếu hạn thanh toán mới < ngày hiện tại và trạng thái là pending
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (parsedDueDate < today && (!status || status === 'pending')) {
                    updateData.status = 'overdue';
                }
                
                updateData.dueDate = parsedDueDate;
            } catch (error) {
                return res.status(400).json({ message: 'Định dạng ngày không hợp lệ' });
            }
        }
        
        const updatedInvoice = await Invoice.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!updatedInvoice) {
            return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
        }
        
        res.json(updatedInvoice);
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(400).json({ message: 'Không thể cập nhật hóa đơn', error: error.message });
    }
};

// Xóa hóa đơn
exports.deleteInvoice = async (req, res) => {
    const { id } = req.params;
    try {
        await Invoice.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: 'Error deleting invoice' });
    }
};

// Cập nhật trạng thái hóa đơn
exports.updateInvoiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const invoice = await Invoice.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).send(invoice);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Thêm hàm tạo mã hóa đơn tự động
const generateInvoiceNumber = async () => {
    try {
        // Lấy hóa đơn mới nhất để tạo mã tiếp theo
        const latestInvoice = await Invoice.findOne().sort({ createdAt: -1 });
        
        // Định dạng: HD-YYYYMMDD-XXX (XXX là số thứ tự tăng dần)
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        
        let counter = 1;
        if (latestInvoice && latestInvoice.invoiceNumber) {
            // Nếu đã có hóa đơn, lấy số thứ tự từ mã hóa đơn cuối cùng
            const parts = latestInvoice.invoiceNumber.split('-');
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
        
        return `HD-${dateStr}-${counterStr}`;
    } catch (error) {
        console.error('Error generating invoice number:', error);
        // Fallback nếu có lỗi
        return `HD-${Date.now()}`;
    }
};

// Thêm hàm kiểm tra và cập nhật trạng thái quá hạn
const checkAndUpdateOverdueStatus = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00

        // Tìm tất cả hóa đơn có trạng thái 'pending' và hạn thanh toán < ngày hiện tại
        const overdueInvoices = await Invoice.find({
            status: 'pending',
            dueDate: { $lt: today }
        });

        // Cập nhật trạng thái của các hóa đơn quá hạn
        for (const invoice of overdueInvoices) {
            invoice.status = 'overdue';
            await invoice.save();
        }

        return overdueInvoices.length; // Trả về số lượng hóa đơn đã cập nhật
    } catch (error) {
        console.error('Error checking overdue invoices:', error);
    }
}; 