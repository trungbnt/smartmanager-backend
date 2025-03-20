const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// GET /api/users/profile
router.get('/profile', (req, res, next) => {
    auth()(req, res, next);
  }, userController.getProfile);

// PUT /api/users/profile
router.put('/profile', (req, res, next) => {
    auth()(req, res, next);
  }, userController.updateProfile);

module.exports = router;