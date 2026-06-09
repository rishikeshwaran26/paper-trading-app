'use strict';

const { getRow, getAll } = require('./base');

const StocksModel = {
  search(query) {
    return getAll(
      `SELECT * FROM stocks WHERE symbol LIKE ? OR name LIKE ? ORDER BY symbol LIMIT 20`,
      [`%${query}%`, `%${query}%`]
    );
  },

  findBySymbol(symbol) {
    return getRow('SELECT * FROM stocks WHERE symbol = ?', [symbol]);
  },

  findById(id) {
    return getRow('SELECT * FROM stocks WHERE id = ?', [id]);
  },

  findBySector(sector) {
    return getAll('SELECT * FROM stocks WHERE sector = ? ORDER BY symbol', [sector]);
  },

  getAll() {
    return getAll('SELECT * FROM stocks ORDER BY symbol');
  }
};

module.exports = StocksModel;
