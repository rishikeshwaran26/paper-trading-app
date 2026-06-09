'use strict';

const { run, getRow, getAll } = require('./base');

const PriceHistoryModel = {
  findByStockId(stockId, fromDate, toDate) {
    return getAll(
      'SELECT * FROM price_history WHERE stock_id = ? AND date BETWEEN ? AND ? ORDER BY date ASC',
      [stockId, fromDate, toDate]
    );
  },

  getLatestByStockId(stockId) {
    return getRow(
      'SELECT * FROM price_history WHERE stock_id = ? ORDER BY date DESC LIMIT 1',
      [stockId]
    );
  },

  upsert(stockId, date, open, high, low, close, volume) {
    run(
      `INSERT INTO price_history (stock_id, date, open, high, low, close, volume)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(stock_id, date) DO UPDATE SET
         open = excluded.open,
         high = excluded.high,
         low = excluded.low,
         close = excluded.close,
         volume = excluded.volume`,
      [stockId, date, open, high, low, close, volume]
    );
  },

  getLatestPriceForAllStocks() {
    return getAll(
      `SELECT ph.* FROM price_history ph
       INNER JOIN (
         SELECT stock_id, MAX(date) AS max_date
         FROM price_history
         GROUP BY stock_id
       ) latest ON ph.stock_id = latest.stock_id AND ph.date = latest.max_date`
    );
  }
};

module.exports = PriceHistoryModel;
