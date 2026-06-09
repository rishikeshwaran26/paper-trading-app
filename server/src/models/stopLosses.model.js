'use strict';

const { run, getRow, getAll, lastInsertId } = require('./base');

const StopLossesModel = {
  findByHoldingId(holdingId) {
    return getAll('SELECT * FROM stop_losses WHERE holding_id = ?', [holdingId]);
  },

  findById(id) {
    return getRow('SELECT * FROM stop_losses WHERE id = ?', [id]);
  },

  insert(holdingId, stockId, stopPrice, quantity) {
    run(
      'INSERT INTO stop_losses (holding_id, stock_id, stop_price, quantity) VALUES (?, ?, ?, ?)',
      [holdingId, stockId, stopPrice, quantity || null]
    );
    return lastInsertId();
  },

  update(id, fields) {
    const sets = [];
    const params = [];
    if (fields.stop_price !== undefined) { sets.push('stop_price = ?'); params.push(fields.stop_price); }
    if (fields.quantity !== undefined) { sets.push('quantity = ?'); params.push(fields.quantity); }
    if (sets.length > 0) {
      run(
        `UPDATE stop_losses SET ${sets.join(', ')}, created_at = datetime('now') WHERE id = ?`,
        [...params, id]
      );
    }
  },

  markTriggered(id) {
    run(
      'UPDATE stop_losses SET is_triggered = 1, triggered_at = datetime(\'now\') WHERE id = ?',
      [id]
    );
  },

  delete(id) {
    run('DELETE FROM stop_losses WHERE id = ?', [id]);
  }
};

module.exports = StopLossesModel;
