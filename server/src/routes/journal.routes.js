'use strict';

const { Router } = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const JournalController = require('../controllers/journal.controller');

const router = Router();

router.get('/', asyncHandler(JournalController.getAll));

router.post('/', validateRequest(null), asyncHandler(JournalController.create));

router.get('/:id', asyncHandler(JournalController.getById));

router.put('/:id', validateRequest(null), asyncHandler(JournalController.update));

router.delete('/:id', asyncHandler(JournalController.delete));

module.exports = router;
