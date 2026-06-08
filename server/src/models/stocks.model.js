'use strict';

const db = require('../config/database');

const StocksModel = {
  search(query) {
    // TODO: SELECT * FROM stocks WHERE symbol LIKE ? OR name LIKE ? ORDER BY symbol LIMIT 20
  },

  findBySymbol(symbol) {
    // TODO: SELECT * FROM stocks WHERE symbol = ?
  },

  findById(id) {
    // TODO: SELECT * FROM stocks WHERE id = ?
  },

  findBySector(sector) {
    // TODO: SELECT * FROM stocks WHERE sector = ? ORDER BY symbol
  },

  getAll() {
    // TODO: SELECT * FROM stocks ORDER BY symbol
  }
};

module.exports = StocksModel;
