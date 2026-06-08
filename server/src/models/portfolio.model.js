'use strict';

const db = require('../config/database');

const PortfolioModel = {
  findByUserId(userId) {
    // TODO: SELECT * FROM portfolio WHERE user_id = ?
  },

  findById(id) {
    // TODO: SELECT * FROM portfolio WHERE id = ?
  },

  create(userId, initialCapital) {
    // TODO: INSERT INTO portfolio (user_id, initial_capital, available_cash) VALUES (?, ?, ?)
  },

  updateCapital(id, initialCapital) {
    // TODO: UPDATE portfolio SET initial_capital = ?, available_cash = ?, updated_at = datetime('now') WHERE id = ?
  },

  updateCash(id, newAvailableCash) {
    // TODO: UPDATE portfolio SET available_cash = ?, updated_at = datetime('now') WHERE id = ?
  },

  deductCash(id, amount) {
    // TODO: UPDATE portfolio SET available_cash = available_cash - ?, updated_at = datetime('now') WHERE id = ?
  },

  addCash(id, amount) {
    // TODO: UPDATE portfolio SET available_cash = available_cash + ?, updated_at = datetime('now') WHERE id = ?
  }
};

module.exports = PortfolioModel;
