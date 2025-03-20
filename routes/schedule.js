const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const auth = require('../middleware/auth');

// Đăng ký các route cho lịch trình
router.post('/', auth(['admin', 'staff']), scheduleController.createSchedule);
router.get('/', auth(['admin', 'staff']), scheduleController.getSchedules);
router.put('/:id/status', auth(['admin', 'staff']), scheduleController.updateScheduleStatus);

module.exports = router; 