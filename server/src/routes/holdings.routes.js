'use strict';

const { Router } = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const HoldingsController = require('../controllers/holdings.controller');

const router = Router();

router.get('/', asyncHandler(HoldingsController.getAll));

router.get('/:id', asyncHandler(HoldingsController.getById));

router.delete('/:id', asyncHandler(HoldingsController.closePosition));

module.exports = router;
