const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const customerController = require('../controllers/customerController');
const quoteRoutes = require('./quote'); // Thêm route quote
const scheduleRoutes = require('./schedule'); // Thêm route schedule
const invoiceRoutes = require('./invoice'); // Thêm route invoice
const reportRoutes = require('./report'); // Thêm route report
const authRoutes = require('./auth'); // Thêm route auth
const jobRequestRoutes = require('./jobRequest'); // Thêm route jobRequest
const userRoutes = require('./user'); // Thêm route userRoutes
const auth = require('../middleware/auth');
const authMiddleware = require('../middleware/authMiddleware');

// Định nghĩa các route cho công việc với phân quyền
router.post('/jobs', auth(['admin', 'staff']), jobController.createJob);
router.get('/jobs', auth(['admin', 'staff']), jobController.getJobs);

// Định nghĩa các route cho khách hàng
router.post('/customers', customerController.createCustomer);
router.get('/customers', authMiddleware(['admin', 'account']), customerController.getCustomers);

// Thêm route cho yêu cầu công việc
router.use('/job-requests', jobRequestRoutes);

// Thêm route cho báo giá
router.use('/quotes', quoteRoutes);

// Thêm route cho lịch trình
router.use('/schedules', scheduleRoutes);

// Thêm route cho hóa đơn
router.use('/invoices', invoiceRoutes);

// Thêm route cho báo cáo
router.use('/reports', reportRoutes);

// Thêm route cho đăng ký và đăng nhập
router.use('/auth', authRoutes);

// Thêm route cho User
router.use('/users', userRoutes);

module.exports = router; 