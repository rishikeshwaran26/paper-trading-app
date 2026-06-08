'use strict';

const { Router } = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const StocksController = require('../controllers/stocks.controller');

const router = Router();

router.get('/', asyncHandler(StocksController.search));

router.get('/:symbol', asyncHandler(StocksController.getBySymbol));

router.get('/:symbol/price-history', asyncHandler(StocksController.getPriceHistory));

module.exports = router;
