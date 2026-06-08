'use strict';

const db = require('../config/database');

const HoldingsModel = {
  findByPortfolioId(portfolioId) {
    // TODO: SELECT h.*, s.symbol, s.name FROM holdings h JOIN stocks s ON s.id = h.stock_id WHERE h.portfolio_id = ?
  },

  findByPortfolioAndStock(portfolioId, stockId) {
    // TODO: SELECT * FROM holdings WHERE portfolio_id = ? AND stock_id = ?
  },

  findById(id) {
    // TODO: SELECT h.*, s.symbol, s.name FROM holdings h JOIN stocks s ON s.id = h.stock_id WHERE h.id = ?
  },

  insert(portfolioId, stockId, quantity, avgPrice, totalInvested, totalCharges) {
    // TODO: INSERT INTO holdings (portfolio_id, stock_id, quantity, average_buy_price, total_invested, total_buy_charges) VALUES (?, ?, ?, ?, ?, ?)
  },

  update(holdingId, quantity, avgPrice, totalInvested, totalCharges) {
    // TODO: UPDATE holdings SET quantity = ?, average_buy_price = ?, total_invested = ?, total_buy_charges = ?, updated_at = datetime('now') WHERE id = ?
  },

  delete(id) {
    // TODO: DELETE FROM holdings WHERE id = ?
  }
};

module.exports = HoldingsModel;
