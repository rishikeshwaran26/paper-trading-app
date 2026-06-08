'use strict';

const { Router } = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const TradesController = require('../controllers/trades.controller');

const router = Router();

// Buy and sell are the two critical write endpoints
router.post('/buy', validateRequest(null), asyncHandler(TradesController.buy));

router.post('/sell', validateRequest(null), asyncHandler(TradesController.sell));

// Read endpoints
router.get('/', asyncHandler(TradesController.getAll));

router.get('/:id', asyncHandler(TradesController.getById));

module.exports = router;
