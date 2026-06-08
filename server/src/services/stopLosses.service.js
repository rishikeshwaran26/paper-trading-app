'use strict';

const StopLossesModel = require('../models/stopLosses.model');

const StopLossesService = {

  getByHoldingId(holdingId) {
    // TODO: Get all stop losses for a holding
  },

  create(holdingId, stockId, stopPrice, quantity) {
    // TODO: Create a new stop loss
    // Validate: stopPrice > 0
    // Validate: stopPrice < average_buy_price (optional convention)
  },

  update(id, fields) {
    // TODO: Update stop price or quantity
  },

  markTriggered(id) {
    // TODO: Mark stop loss as triggered
    // (future: may trigger auto-sell)
  },

  delete(id) {
    // TODO: Delete a stop loss
  }
};

module.exports = StopLossesService;
