'use strict';

const { run, getRow, getAll, lastInsertId } = require('./base');

const HoldingsModel = {
  findByPortfolioId(portfolioId) {
    return getAll(
      `SELECT h.*, s.symbol, s.name
       FROM holdings h
       JOIN stocks s ON s.id = h.stock_id
       WHERE h.portfolio_id = ?
       ORDER BY s.symbol`,
      [portfolioId]
    );
  },

  findByPortfolioAndStock(portfolioId, stockId) {
    return getRow(
      'SELECT * FROM holdings WHERE portfolio_id = ? AND stock_id = ?',
      [portfolioId, stockId]
    );
  },

  findById(id) {
    return getRow(
      `SELECT h.*, s.symbol, s.name
       FROM holdings h
       JOIN stocks s ON s.id = h.stock_id
       WHERE h.id = ?`,
      [id]
    );
  },

  insert(portfolioId, stockId, quantity, avgPrice, totalInvested, totalCharges) {
    run(
      `INSERT INTO holdings (portfolio_id, stock_id, quantity, average_buy_price, total_invested, total_buy_charges)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [portfolioId, stockId, quantity, avgPrice, totalInvested, totalCharges]
    );
    return lastInsertId();
  },

  update(holdingId, quantity, avgPrice, totalInvested, totalCharges) {
    run(
      `UPDATE holdings
       SET quantity = ?, average_buy_price = ?, total_invested = ?, total_buy_charges = ?,
           updated_at = datetime('now')
       WHERE id = ?`,
      [quantity, avgPrice, totalInvested, totalCharges, holdingId]
    );
  },

  delete(id) {
    run('DELETE FROM holdings WHERE id = ?', [id]);
  }
};

module.exports = HoldingsModel;
