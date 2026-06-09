'use strict';

const { run, getRow } = require('./base');

const PortfolioModel = {
  findByUserId(userId) {
    return getRow('SELECT * FROM portfolio WHERE user_id = ?', [userId]);
  },

  findById(id) {
    return getRow('SELECT * FROM portfolio WHERE id = ?', [id]);
  },

  create(userId, initialCapital) {
    run(
      'INSERT INTO portfolio (user_id, initial_capital, available_cash) VALUES (?, ?, ?)',
      [userId, initialCapital, initialCapital]
    );
    const { lastInsertId } = require('./base');
    return lastInsertId();
  },

  updateCapital(id, initialCapital) {
    run(
      'UPDATE portfolio SET initial_capital = ?, available_cash = available_cash + (? - initial_capital), updated_at = datetime(\'now\') WHERE id = ?',
      [initialCapital, initialCapital, id]
    );
  },

  deductCash(id, amount) {
    run(
      'UPDATE portfolio SET available_cash = round(available_cash - ?, 2), updated_at = datetime(\'now\') WHERE id = ?',
      [amount, id]
    );
  },

  addCash(id, amount) {
    run(
      'UPDATE portfolio SET available_cash = round(available_cash + ?, 2), updated_at = datetime(\'now\') WHERE id = ?',
      [amount, id]
    );
  }
};

module.exports = PortfolioModel;
