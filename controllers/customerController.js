const Customer = require('../models/Customer');

// Tạo khách hàng mới
exports.createCustomer = async (req, res) => {
    try {
        const customer = new Customer(req.body);
        await customer.save();
        res.status(201).send(customer);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Lấy danh sách khách hàng
exports.getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers' });
    }
};

// Thêm khách hàng
exports.addCustomer = async (req, res) => {
    const newCustomer = new Customer(req.body);
    try {
        await newCustomer.save();
        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(400).json({ message: 'Error adding customer' });
    }
};

// Cập nhật khách hàng
exports.updateCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedCustomer);
    } catch (error) {
        res.status(400).json({ message: 'Error updating customer' });
    }
};

// Xóa khách hàng
exports.deleteCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        await Customer.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: 'Error deleting customer' });
    }
}; 