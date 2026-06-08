'use strict';

const TradesModel = require('../models/trades.model');

const TradesService = {

  getAll(filters) {
    // TODO: Get all trades with optional filters
    // Support: symbol, type (BUY/SELL), date range, pagination
  },

  getById(id) {
    // TODO: Get single trade with charges
  },

  getByPortfolio(portfolioId) {
    // TODO: Get all trades for a portfolio
  },

  getByStock(stockId) {
    // TODO: Get all trades for a specific stock
  }
};

module.exports = TradesService;
