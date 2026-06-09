'use strict';

const JournalModel = require('../models/journal.model');
const TradesModel = require('../models/trades.model');
const ApiError = require('../utils/ApiError');

const JournalService = {

  getAll(filters) {
    return JournalModel.findAll(filters || {}) || [];
  },

  getById(id) {
    const entry = JournalModel.findById(id);
    if (!entry) {
      throw ApiError.notFound('Journal entry not found', 'JOURNAL_NOT_FOUND');
    }
    return entry;
  },

  create({ tradeId, stockId, entryDate, title, content, mood, tags }) {
    if (!title || typeof title !== 'string') {
      throw ApiError.badRequest('Title is required', 'VALIDATION_ERROR');
    }
    if (tradeId) {
      const trade = TradesModel.findById(tradeId);
      if (!trade) {
        throw ApiError.notFound('Linked trade not found', 'TRADE_NOT_FOUND');
      }
    }
    const id = JournalModel.insert(tradeId || null, stockId || null, entryDate, title, content || null, mood || null, tags || null);
    return JournalModel.findById(id);
  },

  update(id, fields) {
    const existing = JournalModel.findById(id);
    if (!existing) {
      throw ApiError.notFound('Journal entry not found', 'JOURNAL_NOT_FOUND');
    }
    JournalModel.update(id, fields);
    return JournalModel.findById(id);
  },

  delete(id) {
    const existing = JournalModel.findById(id);
    if (!existing) {
      throw ApiError.notFound('Journal entry not found', 'JOURNAL_NOT_FOUND');
    }
    JournalModel.delete(id);
  }
};

module.exports = JournalService;
