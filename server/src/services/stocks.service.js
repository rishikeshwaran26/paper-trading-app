'use strict';

const StocksModel = require('../models/stocks.model');
const PriceHistoryModel = require('../models/priceHistory.model');
const StockNotesModel = require('../models/journal.model'); // TODO: Create stockNotes.model.js or reuse

const StocksService = {

  search(query) {
    // TODO: Search stocks by symbol or name
  },

  getBySymbol(symbol) {
    // TODO: Get stock detail with latest price
    // 1. Lookup by symbol
    // 2. Get latest price from price_history
    // 3. Return stock with price info
  },

  getPriceHistory(symbol, fromDate, toDate) {
    // TODO: Get OHLCV data for charting
    // 1. Lookup stock by symbol
    // 2. Get price_history within date range
    // 3. Return price data array
  }
};

module.exports = StocksService;
