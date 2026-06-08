'use strict';

const { Router } = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const AlertsController = require('../controllers/alerts.controller');

const router = Router();

router.get('/', asyncHandler(AlertsController.getAll));

router.post('/', validateRequest(null), asyncHandler(AlertsController.create));

router.put('/:id', validateRequest(null), asyncHandler(AlertsController.update));

router.patch('/:id/toggle', asyncHandler(AlertsController.toggleActive));

router.delete('/:id', asyncHandler(AlertsController.delete));

module.exports = router;
