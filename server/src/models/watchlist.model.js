'use strict';

const db = require('../config/database');

const WatchlistModel = {
  findByUserId(userId) {
    // TODO: SELECT w.*, s.symbol, s.name, s.sector FROM watchlist_items w JOIN stocks s ON s.id = w.stock_id WHERE w.user_id = ? ORDER BY w.added_at DESC
  },

  findByUserAndStock(userId, stockId) {
    // TODO: SELECT * FROM watchlist_items WHERE user_id = ? AND stock_id = ?
  },

  insert(userId, stockId, notes) {
    // TODO: INSERT INTO watchlist_items (user_id, stock_id, notes) VALUES (?, ?, ?)
  },

  delete(id) {
    // TODO: DELETE FROM watchlist_items WHERE id = ?
  }
};

module.exports = WatchlistModel;
