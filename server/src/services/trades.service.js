'use strict';

const TradesModel = require('../models/trades.model');

const TradesService = {
  getAll(filters = {}) {
    return TradesModel.findAll(filters);
  },

  getById(id) {
    return TradesModel.findById(id);
  },

  getByPortfolio(portfolioId) {
    return TradesModel.findByPortfolioId(portfolioId);
  },

  getByStock(stockId) {
    return TradesModel.findByStockId(stockId);
  }
};

module.exports = TradesService;
