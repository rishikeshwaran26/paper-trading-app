'use strict';

const WatchlistModel = require('../models/watchlist.model');
const StocksModel = require('../models/stocks.model');
const PriceHistoryModel = require('../models/priceHistory.model');
const ApiError = require('../utils/ApiError');

const DEFAULT_USER_ID = 1;

const WatchlistService = {
  getAll() {
    const items = WatchlistModel.findByUserId(DEFAULT_USER_ID);
    return items.map(item => {
      const latestPrice = PriceHistoryModel.getLatestByStockId(item.stock_id);
      return {
        ...item,
        current_price: latestPrice ? latestPrice.close : null,
        last_updated: latestPrice ? latestPrice.date : null
      };
    });
  },

  add(symbol, notes) {
    const stock = StocksModel.findBySymbol(symbol.toUpperCase().trim());
    if (!stock) {
      throw ApiError.notFound(`Stock '${symbol}' not found`, 'STOCK_NOT_FOUND');
    }

    const existing = WatchlistModel.findByUserAndStock(DEFAULT_USER_ID, stock.id);
    if (existing) {
      throw ApiError.conflict(`'${symbol}' is already in your watchlist`, 'ALREADY_IN_WATCHLIST');
    }

    const id = WatchlistModel.insert(DEFAULT_USER_ID, stock.id, notes);
    const item = WatchlistModel.findByUserId(DEFAULT_USER_ID)
      .find(w => w.id === id);
    return item || { id, stock_id: stock.id, symbol: stock.symbol, notes };
  },

  remove(id) {
    const item = WatchlistModel.findByUserId(DEFAULT_USER_ID)
      .find(w => w.id === id);
    if (!item) {
      throw ApiError.notFound('Watchlist item not found', 'WATCHLIST_ITEM_NOT_FOUND');
    }
    WatchlistModel.delete(id);
  }
};

module.exports = WatchlistService;
