'use strict';

const PortfolioModel = require('../models/portfolio.model');
const HoldingsModel = require('../models/holdings.model');
const PriceHistoryModel = require('../models/priceHistory.model');

const PortfolioService = {

  getSummary() {
    // TODO: Get portfolio with computed current value and P&L
    // 1. Get portfolio for user
    // 2. Get all holdings with latest prices
    // 3. Compute total invested, current value, unrealized P&L
    // 4. Return summary object
  },

  setInitialCapital(initialCapital) {
    // TODO: Set up initial portfolio capital
    // Validate: initialCapital > 0
    // Validate: portfolio doesn't already exist (or allow reset)
    // Create portfolio record with initial_capital = available_cash
  },

  getDetailed() {
    // TODO: Get detailed portfolio with per-holding breakdown
    // 1. Get portfolio
    // 2. Get all holdings with latest prices
    // 3. For each holding, compute: invested, current_value, unrealized_pnl, pnl_percent
    // 4. Return portfolio + holdings array
  }
};

module.exports = PortfolioService;
