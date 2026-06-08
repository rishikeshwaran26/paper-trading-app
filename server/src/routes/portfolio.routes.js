'use strict';

const { Router } = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const PortfolioController = require('../controllers/portfolio.controller');

const router = Router();

router.get('/', asyncHandler(PortfolioController.getSummary));

router.get('/detailed', asyncHandler(PortfolioController.getDetailed));

router.put('/capital', validateRequest(null), asyncHandler(PortfolioController.setCapital));

module.exports = router;
