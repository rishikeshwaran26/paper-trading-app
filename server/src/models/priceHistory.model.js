'use strict';

const db = require('../config/database');

const PriceHistoryModel = {
  findByStockId(stockId, fromDate, toDate) {
    // TODO: SELECT * FROM price_history WHERE stock_id = ? AND date BETWEEN ? AND ? ORDER BY date ASC
  },

  getLatestByStockId(stockId) {
    // TODO: SELECT * FROM price_history WHERE stock_id = ? ORDER BY date DESC LIMIT 1
  },

  upsert(stockId, date, open, high, low, close, volume) {
    // TODO: INSERT INTO price_history (stock_id, date, open, high, low, close, volume) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(stock_id, date) DO UPDATE SET open = ?, high = ?, low = ?, close = ?, volume = ?
  },

  getLatestPriceForAllStocks() {
    // TODO: SELECT ph.* FROM price_history ph INNER JOIN (SELECT stock_id, MAX(date) AS max_date FROM price_history GROUP BY stock_id) latest ON ph.stock_id = latest.stock_id AND ph.date = latest.max_date
  }
};

module.exports = PriceHistoryModel;
