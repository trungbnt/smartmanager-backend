const Equipment = require('../models/Equipment');

exports.createEquipment = async (req, res) => {
    try {
        const equipment = new Equipment(req.body);
        await equipment.save();
        res.status(201).json(equipment);
    } catch (error) {
        res.status(400).json({ message: 'Không thể tạo thiết bị mới', error: error.message });
    }
};

exports.getEquipments = async (req, res) => {
    try {
        const equipments = await Equipment.find()
            .populate('assignedTo', 'name')
            .sort({ createdAt: -1 });
        res.json(equipments);
    } catch (error) {
        res.status(500).json({ message: 'Không thể lấy danh sách thiết bị' });
    }
};

exports.updateEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(equipment);
    } catch (error) {
        res.status(400).json({ message: 'Không thể cập nhật thông tin thiết bị' });
    }
};

exports.deleteEquipment = async (req, res) => {
    try {
        await Equipment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa thiết bị' });
    } catch (error) {
        res.status(400).json({ message: 'Không thể xóa thiết bị' });
    }
};

exports.addMaintenance = async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        equipment.maintenanceHistory.push(req.body);
        await equipment.save();
        res.json(equipment);
    } catch (error) {
        res.status(400).json({ message: 'Không thể thêm lịch bảo trì' });
    }
};