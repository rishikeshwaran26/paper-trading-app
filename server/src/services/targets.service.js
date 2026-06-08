'use strict';

const TargetsModel = require('../models/targets.model');

const TargetsService = {

  getByHoldingId(holdingId) {
    // TODO: Get all targets for a holding
  },

  create(holdingId, stockId, targetPrice, quantity) {
    // TODO: Create a new target
    // Validate: targetPrice > 0
    // Validate: quantity > 0 OR null (null = remaining shares)
  },

  update(id, fields) {
    // TODO: Update target price or quantity
  },

  markAchieved(id) {
    // TODO: Mark target as achieved
    // (future: may trigger auto-sell)
  },

  delete(id) {
    // TODO: Delete a target
  }
};

module.exports = TargetsService;
