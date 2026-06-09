'use strict';

const { run, getRow, getAll, lastInsertId } = require('./base');

const WatchlistModel = {
  findByUserId(userId) {
    return getAll(
      `SELECT w.*, s.symbol, s.name, s.sector
       FROM watchlist_items w
       JOIN stocks s ON s.id = w.stock_id
       WHERE w.user_id = ?
       ORDER BY w.added_at DESC`,
      [userId]
    );
  },

  countByUserId(userId) {
    const row = getRow(
      'SELECT COUNT(*) AS count FROM watchlist_items WHERE user_id = ?',
      [userId]
    );
    return row ? row.count : 0;
  },

  findByUserAndStock(userId, stockId) {
    return getRow(
      'SELECT * FROM watchlist_items WHERE user_id = ? AND stock_id = ?',
      [userId, stockId]
    );
  },

  insert(userId, stockId, notes) {
    run(
      'INSERT INTO watchlist_items (user_id, stock_id, notes) VALUES (?, ?, ?)',
      [userId, stockId, notes || null]
    );
    return lastInsertId();
  },

  delete(id) {
    run('DELETE FROM watchlist_items WHERE id = ?', [id]);
  }
};

module.exports = WatchlistModel;
