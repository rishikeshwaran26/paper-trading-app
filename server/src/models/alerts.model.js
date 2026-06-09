'use strict';

const { run, getRow, getAll, lastInsertId } = require('./base');

const AlertsModel = {
  findByUserId(userId) {
    return getAll(
      `SELECT a.*, s.symbol
       FROM price_alerts a
       JOIN stocks s ON s.id = a.stock_id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC`,
      [userId]
    );
  },

  findActive(userId) {
    return getAll(
      `SELECT a.*, s.symbol
       FROM price_alerts a
       JOIN stocks s ON s.id = a.stock_id
       WHERE a.user_id = ? AND a.is_active = 1 AND a.is_triggered = 0
       ORDER BY a.created_at DESC`,
      [userId]
    );
  },

  countActive(userId) {
    const row = getRow(
      `SELECT COUNT(*) AS count
       FROM price_alerts
       WHERE user_id = ? AND is_active = 1 AND is_triggered = 0`,
      [userId]
    );
    return row ? row.count : 0;
  },

  findById(id) {
    return getRow(
      `SELECT a.*, s.symbol
       FROM price_alerts a
       JOIN stocks s ON s.id = a.stock_id
       WHERE a.id = ?`,
      [id]
    );
  },

  insert(userId, stockId, alertType, targetPrice) {
    run(
      'INSERT INTO price_alerts (user_id, stock_id, alert_type, target_price) VALUES (?, ?, ?, ?)',
      [userId, stockId, alertType, targetPrice]
    );
    return lastInsertId();
  },

  update(id, fields) {
    const sets = [];
    const params = [];
    if (fields.alert_type !== undefined) { sets.push('alert_type = ?'); params.push(fields.alert_type); }
    if (fields.target_price !== undefined) { sets.push('target_price = ?'); params.push(fields.target_price); }
    if (sets.length > 0) {
      run(
        `UPDATE price_alerts SET ${sets.join(', ')}, created_at = datetime('now') WHERE id = ?`,
        [...params, id]
      );
    }
  },

  toggleActive(id) {
    run(
      `UPDATE price_alerts SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?`,
      [id]
    );
  },

  markTriggered(id, currentPrice) {
    run(
      `UPDATE price_alerts SET is_triggered = 1, is_active = 0, triggered_at = datetime('now'), triggered_price = ? WHERE id = ?`,
      [currentPrice, id]
    );
  },

  delete(id) {
    run('DELETE FROM price_alerts WHERE id = ?', [id]);
  }
};

module.exports = AlertsModel;
