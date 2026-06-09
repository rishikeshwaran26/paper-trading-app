'use strict';

const { run, getRow, getAll, lastInsertId } = require('./base');

const TradesModel = {
  findAll(filters = {}) {
    let sql = `SELECT t.*, s.symbol, s.name FROM trades t JOIN stocks s ON s.id = t.stock_id WHERE 1=1`;
    const params = [];
    if (filters.symbol) { sql += ' AND s.symbol = ?'; params.push(filters.symbol); }
    if (filters.trade_type) { sql += ' AND t.trade_type = ?'; params.push(filters.trade_type); }
    if (filters.from) { sql += ' AND t.trade_date >= ?'; params.push(filters.from); }
    if (filters.to) { sql += ' AND t.trade_date <= ?'; params.push(filters.to); }
    sql += ' ORDER BY t.trade_date DESC, t.created_at DESC';
    if (filters.page && filters.limit) {
      const offset = (filters.page - 1) * filters.limit;
      sql += ` LIMIT ? OFFSET ?`;
      params.push(filters.limit, offset);
    }
    return getAll(sql, params);
  },

  findById(id) {
    return getRow(
      `SELECT t.*, s.symbol, s.name
       FROM trades t
       JOIN stocks s ON s.id = t.stock_id
       WHERE t.id = ?`,
      [id]
    );
  },

  findByPortfolioId(portfolioId) {
    return getAll(
      `SELECT t.*, s.symbol
       FROM trades t
       JOIN stocks s ON s.id = t.stock_id
       WHERE t.portfolio_id = ?
       ORDER BY t.trade_date DESC, t.created_at DESC`,
      [portfolioId]
    );
  },

  findByStockId(stockId) {
    return getAll(
      'SELECT * FROM trades WHERE stock_id = ? ORDER BY trade_date DESC',
      [stockId]
    );
  },

  insert(portfolioId, stockId, tradeType, quantity, price, totalValue, tradeDate, notes) {
    run(
      `INSERT INTO trades (portfolio_id, stock_id, trade_type, quantity, price, total_value, trade_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [portfolioId, stockId, tradeType, quantity, price, totalValue, tradeDate || new Date().toISOString().slice(0, 10), notes || null]
    );
    return lastInsertId();
  },

  getLastTradeDate(portfolioId, stockId) {
    const row = getRow(
      'SELECT MAX(trade_date) AS last_date FROM trades WHERE portfolio_id = ? AND stock_id = ?',
      [portfolioId, stockId]
    );
    return row ? row.last_date : null;
  }
};

module.exports = TradesModel;
