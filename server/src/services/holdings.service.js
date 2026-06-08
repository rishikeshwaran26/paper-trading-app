'use strict';

const HoldingsModel = require('../models/holdings.model');
const PriceHistoryModel = require('../models/priceHistory.model');
const TargetsModel = require('../models/targets.model');
const StopLossesModel = require('../models/stopLosses.model');

const HoldingsService = {

  getAll() {
    // TODO: Get all holdings with current prices and P&L
    // 1. Get holdings from model
    // 2. For each, get latest price
    // 3. Compute current_value, unrealized_pl, unrealized_pl_percent
    // 4. Return enriched holdings array
  },

  getById(id) {
    // TODO: Get single holding with targets, stop losses, and current price
    // 1. Get holding
    // 2. Get latest price
    // 3. Get linked targets
    // 4. Get linked stop losses
    // 5. Return enriched holding
  },

  closePosition(id) {
    // TODO: Force-close a position (admin/cleanup, not a standard sell)
    // 1. Get holding
    // 2. Delete holding and related targets/stop_losses
    // 3. (does not create a trade or affect P&L — use sell for that)
  }
};

module.exports = HoldingsService;
