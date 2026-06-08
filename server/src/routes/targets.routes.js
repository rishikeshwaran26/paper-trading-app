'use strict';

const { Router } = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const TargetsController = require('../controllers/targets.controller');

const router = Router();

// Targets nested under holdings
router.get('/holdings/:holdingId', asyncHandler(TargetsController.getByHoldingId));
router.post('/holdings/:holdingId', validateRequest(null), asyncHandler(TargetsController.create));

// Direct target operations
router.put('/:id', validateRequest(null), asyncHandler(TargetsController.update));
router.patch('/:id/achieve', asyncHandler(TargetsController.markAchieved));
router.delete('/:id', asyncHandler(TargetsController.delete));

module.exports = router;
