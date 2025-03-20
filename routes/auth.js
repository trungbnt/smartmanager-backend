const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const customerController = require('../controllers/customerController');
const jobRequestController = require('../controllers/jobRequestController');
const { createQuote, getQuotes, updateQuote, deleteQuote, updateQuoteStatus } = require('../controllers/quoteController');
const scheduleController = require('../controllers/scheduleController');
const invoiceController = require('../controllers/invoiceController');
const reportController = require('../controllers/reportController');
const User = require('../models/User');
const auth = require('../middleware/auth');
const employeeController = require('../controllers/employeeController');
const equipmentController = require('../controllers/equipmentController');
const userController = require('../controllers/userController');
const cloudinary = require('cloudinary').v2;

// Đăng ký người dùng mới
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !user.comparePassword(password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = user.generateToken();
    res.json({
        token,
        role: user.role,
    });
});

// Route yêu cầu quyền truy cập
router.get('/customers', auth(['admin', 'account', 'sales']), customerController.getCustomers);
router.post('/customers', auth(['admin', 'account']), customerController.addCustomer);
router.put('/customers/:id', auth(['admin', 'account']), customerController.updateCustomer);
router.delete('/customers/:id', auth(['admin']), customerController.deleteCustomer);

// Route cho yêu cầu công việc
router.get('/job-requests', auth(['admin', 'account', 'sales', 'customer']), jobRequestController.getJobRequests);
router.post('/job-requests', auth(['admin', 'account', 'customer']), jobRequestController.addJobRequest);
router.put('/job-requests/:id', auth(['admin', 'account']), jobRequestController.updateJobRequest);
router.delete('/job-requests/:id', auth(['admin']), jobRequestController.deleteJobRequest);

// Route cho báo giá
router.get('/quotes', auth(['admin', 'account', 'sales']), getQuotes);
router.post('/quotes', auth(['admin', 'account']), async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            req.app.locals.upload.single('file')(req, res, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        const file = req.file;
        let fileUrl = null;

        if (file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'auto' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(file.buffer);
            });
            fileUrl = result.secure_url;
        }

        await createQuote(req, res, fileUrl);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading file to Cloudinary' });
    }
});
router.put('/quotes/:id', auth(['admin', 'account']), async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            req.app.locals.upload.single('file')(req, res, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        const file = req.file;
        let fileUrl = null;

        if (file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'auto' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(file.buffer);
            });
            fileUrl = result.secure_url;
        }

        await updateQuote(req, res, fileUrl);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading file to Cloudinary' });
    }
});
router.delete('/quotes/:id', auth(['admin']), deleteQuote);
router.patch('/quotes/:id/status', auth(['admin']), updateQuoteStatus);

// Route cho lịch trình
router.get('/schedules', auth(['admin', 'account', 'sales']), scheduleController.getSchedules);
router.post('/schedules', auth(['admin', 'account']), scheduleController.addSchedule);
router.put('/schedules/:id', auth(['admin', 'account']), scheduleController.updateSchedule);
router.delete('/schedules/:id', auth(['admin']), scheduleController.deleteSchedule);

// Route cho hóa đơn
router.get('/invoices', auth(['admin', 'account']), invoiceController.getInvoices);
router.post('/invoices', auth(['admin', 'account']), invoiceController.addInvoice);
router.put('/invoices/:id', auth(['admin', 'account']), invoiceController.updateInvoice);
router.delete('/invoices/:id', auth(['admin']), invoiceController.deleteInvoice);

// Route cho báo cáo
router.get('/reports', auth(['admin', 'account']), reportController.getReports);
router.post('/reports', auth(['admin', 'account']), reportController.addReport);
router.put('/reports/:id', auth(['admin', 'account']), reportController.updateReport);
router.delete('/reports/:id', auth(['admin']), reportController.deleteReport);

// Employee routes
router.post('/employees', auth(['admin']), employeeController.createEmployee);
router.get('/employees', auth(['admin']), employeeController.getEmployees);
router.put('/employees/:id', auth(['admin']), employeeController.updateEmployee);
router.delete('/employees/:id', auth(['admin']), employeeController.deleteEmployee);

// Equipment routes
router.post('/equipment', auth(['admin', 'engineering']), equipmentController.createEquipment);
router.get('/equipment', auth(['admin', 'engineering']), equipmentController.getEquipments);
router.put('/equipment/:id', auth(['admin', 'engineering']), equipmentController.updateEquipment);
router.delete('/equipment/:id', auth(['admin']), equipmentController.deleteEquipment);
router.post('/equipment/:id/maintenance', auth(['admin', 'engineering']), equipmentController.addMaintenance);

// Thêm các routes cho profile
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

module.exports = router;