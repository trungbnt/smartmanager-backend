const Employee = require('../models/Employee');

exports.createEmployee = async (req, res) => {
    try {
        const employee = new Employee(req.body);
        await employee.save();
        res.status(201).json(employee);
    } catch (error) {
        res.status(400).json({ message: 'Không thể tạo nhân viên mới', error: error.message });
    }
};

exports.getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().sort({ createdAt: -1 });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Không thể lấy danh sách nhân viên' });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(employee);
    } catch (error) {
        res.status(400).json({ message: 'Không thể cập nhật thông tin nhân viên' });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa nhân viên' });
    } catch (error) {
        res.status(400).json({ message: 'Không thể xóa nhân viên' });
    }
};