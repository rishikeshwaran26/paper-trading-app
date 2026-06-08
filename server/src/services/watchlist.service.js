'use strict';

const WatchlistModel = require('../models/watchlist.model');
const StocksModel = require('../models/stocks.model');
const PriceHistoryModel = require('../models/priceHistory.model');

const WatchlistService = {

  getAll() {
    // TODO: Get all watchlist items with current prices
    // 1. Get watchlist from model
    // 2. For each stock, get latest price
    // 3. Return enriched watchlist with price data
  },

  add(symbol, notes) {
    // TODO: Add a stock to watchlist
    // 1. Lookup stock by symbol
    // 2. Check not already in watchlist
    // 3. Insert watchlist item
    // 4. Return created item
  },

  remove(id) {
    // TODO: Remove a stock from watchlist
  }
};

module.exports = WatchlistService;
