'use strict';

const db = require('../config/database');

const TargetsModel = {
  findByHoldingId(holdingId) {
    // TODO: SELECT * FROM targets WHERE holding_id = ?
  },

  findById(id) {
    // TODO: SELECT * FROM targets WHERE id = ?
  },

  insert(holdingId, stockId, targetPrice, quantity) {
    // TODO: INSERT INTO targets (holding_id, stock_id, target_price, quantity) VALUES (?, ?, ?, ?)
  },

  update(id, fields) {
    // TODO: UPDATE targets SET target_price = ?, quantity = ?, updated_at = datetime('now') WHERE id = ?
  },

  markAchieved(id, triggeredPrice) {
    // TODO: UPDATE targets SET is_achieved = 1, achieved_at = datetime('now') WHERE id = ?
  },

  delete(id) {
    // TODO: DELETE FROM targets WHERE id = ?
  }
};

module.exports = TargetsModel;
