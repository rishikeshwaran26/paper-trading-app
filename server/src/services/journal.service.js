'use strict';

const JournalModel = require('../models/journal.model');

const JournalService = {

  getAll(filters) {
    // TODO: Get journal entries with optional filters
    // Support: symbol, mood, tag, date range, pagination
  },

  getById(id) {
    // TODO: Get single entry with linked trade and stock info
  },

  create({ tradeId, stockId, entryDate, title, content, mood, tags }) {
    // TODO: Create a new journal entry
    // Validate: title required
    // Validate: if tradeId provided, it must exist
  },

  update(id, fields) {
    // TODO: Update journal entry
  },

  delete(id) {
    // TODO: Delete journal entry
  }
};

module.exports = JournalService;
