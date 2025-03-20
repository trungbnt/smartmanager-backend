const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const auth = require('../middleware/auth');

// Đăng ký các route cho hóa đơn
router.post('/', auth(['admin', 'accounting']), invoiceController.createInvoice);
router.get('/', auth(['admin', 'accounting']), invoiceController.getInvoices);
router.put('/:id/status', auth(['admin', 'accounting']), invoiceController.updateInvoiceStatus);

module.exports = router; 