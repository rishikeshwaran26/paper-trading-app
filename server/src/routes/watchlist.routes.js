'use strict';

const { Router } = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const WatchlistController = require('../controllers/watchlist.controller');

const router = Router();

router.get('/', asyncHandler(WatchlistController.getAll));
router.post('/', validateRequest(null), asyncHandler(WatchlistController.add));
router.delete('/:id', asyncHandler(WatchlistController.remove));

module.exports = router;
