const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

// Đăng ký các route cho báo cáo
router.post('/', auth(['admin']), reportController.createReport);
router.get('/', auth(['admin']), reportController.getReports);
router.put('/:id', auth(['admin']), reportController.updateReport);

module.exports = router; 