'use strict';

const db = require('../config/database');

const StopLossesModel = {
  findByHoldingId(holdingId) {
    // TODO: SELECT * FROM stop_losses WHERE holding_id = ?
  },

  findById(id) {
    // TODO: SELECT * FROM stop_losses WHERE id = ?
  },

  insert(holdingId, stockId, stopPrice, quantity) {
    // TODO: INSERT INTO stop_losses (holding_id, stock_id, stop_price, quantity) VALUES (?, ?, ?, ?)
  },

  update(id, fields) {
    // TODO: UPDATE stop_losses SET stop_price = ?, quantity = ?, updated_at = datetime('now') WHERE id = ?
  },

  markTriggered(id, triggeredPrice) {
    // TODO: UPDATE stop_losses SET is_triggered = 1, triggered_at = datetime('now') WHERE id = ?
  },

  delete(id) {
    // TODO: DELETE FROM stop_losses WHERE id = ?
  }
};

module.exports = StopLossesModel;
