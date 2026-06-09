'use strict';

const { run, getRow, getAll, lastInsertId } = require('./base');

const TargetsModel = {
  findByHoldingId(holdingId) {
    return getAll('SELECT * FROM targets WHERE holding_id = ?', [holdingId]);
  },

  findById(id) {
    return getRow('SELECT * FROM targets WHERE id = ?', [id]);
  },

  insert(holdingId, stockId, targetPrice, quantity) {
    run(
      'INSERT INTO targets (holding_id, stock_id, target_price, quantity) VALUES (?, ?, ?, ?)',
      [holdingId, stockId, targetPrice, quantity || null]
    );
    return lastInsertId();
  },

  update(id, fields) {
    const sets = [];
    const params = [];
    if (fields.target_price !== undefined) { sets.push('target_price = ?'); params.push(fields.target_price); }
    if (fields.quantity !== undefined) { sets.push('quantity = ?'); params.push(fields.quantity); }
    if (sets.length > 0) {
      run(
        `UPDATE targets SET ${sets.join(', ')}, created_at = datetime('now') WHERE id = ?`,
        [...params, id]
      );
    }
  },

  markAchieved(id) {
    run(
      'UPDATE targets SET is_achieved = 1, achieved_at = datetime(\'now\') WHERE id = ?',
      [id]
    );
  },

  delete(id) {
    run('DELETE FROM targets WHERE id = ?', [id]);
  }
};

module.exports = TargetsModel;
