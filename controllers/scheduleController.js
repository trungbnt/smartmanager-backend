const Schedule = require('../models/Schedule');

// Tạo lịch trình mới
exports.createSchedule = async (req, res) => {
    try {
        const { jobRequestId, vehicleId, startTime, endTime } = req.body;
        const schedule = new Schedule({ jobRequestId, vehicleId, startTime, endTime });
        await schedule.save();
        res.status(201).send(schedule);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Lấy danh sách lịch trình
exports.getSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find();
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schedules' });
    }
};

// Thêm lịch trình
exports.addSchedule = async (req, res) => {
    const newSchedule = new Schedule(req.body);
    try {
        await newSchedule.save();
        res.status(201).json(newSchedule);
    } catch (error) {
        res.status(400).json({ message: 'Error adding schedule' });
    }
};

// Cập nhật lịch trình
exports.updateSchedule = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedSchedule = await Schedule.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedSchedule);
    } catch (error) {
        res.status(400).json({ message: 'Error updating schedule' });
    }
};

// Xóa lịch trình
exports.deleteSchedule = async (req, res) => {
    const { id } = req.params;
    try {
        await Schedule.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: 'Error deleting schedule' });
    }
};

// Cập nhật trạng thái lịch trình
exports.updateScheduleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const schedule = await Schedule.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).send(schedule);
    } catch (error) {
        res.status(400).send(error);
    }
}; 