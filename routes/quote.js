const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const Quote = require('../models/Quote'); // Assuming you have a Quote model
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Get the file name without extension
        const fileName = path.parse(file.originalname).name;
        // Get the file extension
        const fileExt = path.extname(file.originalname);
        // Create unique suffix
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Combine original filename with unique suffix
        cb(null, `${fileName}-${uniqueSuffix}${fileExt}`);
    }
});

// Configure multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Định dạng file không được hỗ trợ. Chỉ chấp nhận PDF, DOCX, XLSX.'));
        }
    }
});

// Đăng ký các route cho báo giá
router.post('/', auth(['admin', 'sales']), quoteController.createQuote);
router.get('/', auth(['admin', 'sales']), quoteController.getQuotes);
router.put('/:id/status', auth(['admin', 'sales']), quoteController.updateQuoteStatus);

// Create new quote
router.post('/quotes', auth(['admin', 'sales']), upload.single('file'), async (req, res) => {
    try {
        // Log request data for debugging
        console.log('Request body:', req.body);
        console.log('File:', req.file);

        const { jobRequestId, amount, details } = req.body;

        // Validate required fields
        if (!jobRequestId || !amount || !details) {
            return res.status(400).json({
                message: 'Vui lòng điền đầy đủ thông tin',
                received: { jobRequestId, amount, details }
            });
        }

        // Parse amount to ensure it's a number
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount)) {
            return res.status(400).json({
                message: 'Số tiền không hợp lệ'
            });
        }

        // Create quote data
        const quoteData = {
            jobRequestId: jobRequestId,
            amount: parsedAmount,
            details: details,
            status: 'pending'
        };

        // Add file URL if file was uploaded
        if (req.file) {
            quoteData.fileUrl = `/uploads/${req.file.filename}`;
        }

        // Create and save quote
        const quote = new Quote(quoteData);
        const savedQuote = await quote.save();

        res.status(201).json(savedQuote);
    } catch (error) {
        console.error('Quote creation error:', error);
        res.status(400).json({
            message: 'Không thể tạo báo giá',
            error: error.message
        });
    }
});

// Update quote
router.put('/quotes/:id', async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id);
        if (!quote) {
            return res.status(404).json({ message: 'Quote not found' });
        }

        quote.jobRequestId = req.body.jobRequestId || quote.jobRequestId;
        quote.amount = req.body.amount || quote.amount;
        quote.details = req.body.details || quote.details;
        quote.status = req.body.status || quote.status;

        await quote.save();
        res.json(quote);
    } catch (error) {
        res.status(400).json({ message: 'Error updating quote', error: error.message });
    }
});

// Delete quote
router.delete('/quotes/:id', async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id);
        if (!quote) {
            return res.status(404).json({ message: 'Quote not found' });
        }

        // Delete associated file if exists
        if (quote.fileUrl) {
            const filePath = path.join(__dirname, '..', quote.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await quote.deleteOne();
        res.json({ message: 'Quote deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting quote', error: error.message });
    }
});

// Get all quotes
router.get('/quotes', auth(['admin', 'sales', 'engineering']), async (req, res) => {
    try {
        const quotes = await Quote.find();
        res.json(quotes);
    } catch (err) {
        console.error('Error fetching quotes:', err);
        res.status(500).json({ message: 'Error fetching quotes' });
    }
});

// Get single quote
router.get('/quotes/:id', async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id);
        if (!quote) {
            return res.status(404).json({ message: 'Quote not found' });
        }
        res.json(quote);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching quote', error: error.message });
    }
});

module.exports = router;