const Job = require('../models/Job');

// Tạo công việc mới
exports.createJob = async (req, res) => {
    try {
        const job = new Job(req.body);
        await job.save();
        res.status(201).send(job);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Lấy danh sách công việc
exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.find();
        res.status(200).send(jobs);
    } catch (error) {
        res.status(500).send(error);
    }
}; 