'use strict';

const db = require('../config/database');

const TradesModel = {
  findAll(filters = {}) {
    // TODO: SELECT t.*, s.symbol FROM trades t JOIN stocks s ON s.id = t.stock_id WHERE ...
    // TODO: Support filters: symbol, trade_type, from, to, page, limit
    // TODO: ORDER BY trade_date DESC
  },

  findById(id) {
    // TODO: SELECT t.*, s.symbol, s.name FROM trades t JOIN stocks s ON s.id = t.stock_id WHERE t.id = ?
  },

  findByPortfolioId(portfolioId) {
    // TODO: SELECT t.*, s.symbol FROM trades t JOIN stocks s ON s.id = t.stock_id WHERE t.portfolio_id = ? ORDER BY t.trade_date DESC
  },

  findByStockId(stockId) {
    // TODO: SELECT * FROM trades WHERE stock_id = ? ORDER BY trade_date DESC
  },

  insert(portfolioId, stockId, tradeType, quantity, price, totalValue, tradeDate, notes) {
    // TODO: INSERT INTO trades (portfolio_id, stock_id, trade_type, quantity, price, total_value, trade_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  },

  getLastTradeDate(portfolioId, stockId) {
    // TODO: SELECT MAX(trade_date) FROM trades WHERE portfolio_id = ? AND stock_id = ?
  }
};

module.exports = TradesModel;
