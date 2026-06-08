'use strict';

const db = require('../config/database');

const AlertsModel = {
  findByUserId(userId) {
    // TODO: SELECT a.*, s.symbol FROM price_alerts a JOIN stocks s ON s.id = a.stock_id WHERE a.user_id = ? ORDER BY a.created_at DESC
  },

  findActive() {
    // TODO: SELECT a.*, s.symbol FROM price_alerts a JOIN stocks s ON s.id = a.stock_id WHERE a.is_active = 1 AND a.is_triggered = 0
  },

  findById(id) {
    // TODO: SELECT a.*, s.symbol FROM price_alerts a JOIN stocks s ON s.id = a.stock_id WHERE a.id = ?
  },

  insert(userId, stockId, alertType, targetPrice) {
    // TODO: INSERT INTO price_alerts (user_id, stock_id, alert_type, target_price) VALUES (?, ?, ?, ?)
  },

  update(id, fields) {
    // TODO: UPDATE price_alerts SET alert_type = ?, target_price = ? WHERE id = ?
  },

  toggleActive(id) {
    // TODO: UPDATE price_alerts SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?
  },

  markTriggered(id, currentPrice) {
    // TODO: UPDATE price_alerts SET is_triggered = 1, is_active = 0, triggered_at = datetime('now'), triggered_price = ? WHERE id = ?
  },

  delete(id) {
    // TODO: DELETE FROM price_alerts WHERE id = ?
  }
};

module.exports = AlertsModel;
