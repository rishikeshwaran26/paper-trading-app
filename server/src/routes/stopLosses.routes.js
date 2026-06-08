'use strict';

const { Router } = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const StopLossesController = require('../controllers/stopLosses.controller');

const router = Router();

// Stop losses nested under holdings
router.get('/holdings/:holdingId', asyncHandler(StopLossesController.getByHoldingId));
router.post('/holdings/:holdingId', validateRequest(null), asyncHandler(StopLossesController.create));

// Direct stop loss operations
router.put('/:id', validateRequest(null), asyncHandler(StopLossesController.update));
router.patch('/:id/trigger', asyncHandler(StopLossesController.markTriggered));
router.delete('/:id', asyncHandler(StopLossesController.delete));

module.exports = router;
