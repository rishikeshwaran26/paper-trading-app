'use strict';

const { Router } = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const DashboardController = require('../controllers/dashboard.controller');

const router = Router();

router.get('/', asyncHandler(DashboardController.getDashboard));

module.exports = router;
