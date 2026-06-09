'use strict';

const WatchlistModel = require('../models/watchlist.model');
const StocksModel = require('../models/stocks.model');
const PriceHistoryModel = require('../models/priceHistory.model');
const ApiError = require('../utils/ApiError');

const DEFAULT_USER_ID = 1;

function round(val) {
  return Math.round(val * 100) / 100;
}

const WatchlistService = {
  getAll() {
    const items = WatchlistModel.findByUserId(DEFAULT_USER_ID) || [];
    const latestPrices = PriceHistoryModel.getLatestPriceForAllStocks() || [];
    const priceMap = {};
    for (const row of latestPrices) {
      priceMap[row.stock_id] = row;
    }
    return items.map(item => {
      const priceRow = priceMap[item.stock_id];
      const ltp = priceRow ? priceRow.close : 0;
      const day_high = priceRow ? priceRow.high : 0;
      const day_low = priceRow ? priceRow.low : 0;
      const volume = priceRow ? priceRow.volume : 0;
      const change = 0;
      const change_percent = 0;
      return {
        id: item.stock_id,
        watchlist_id: item.id,
        symbol: item.symbol,
        name: item.name,
        isin: '',
        series: 'EQ',
        exchange: 'NSE',
        sector: item.sector || null,
        industry: null,
        face_value: 10,
        ltp,
        change,
        change_percent,
        day_high,
        day_low,
        volume
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
    const item = WatchlistModel.findByUserId(DEFAULT_USER_ID).find(w => w.id === id);
    const latestPrice = PriceHistoryModel.getLatestByStockId(stock.id);
    return item ? {
      id: stock.id,
      watchlist_id: item.id,
      symbol: stock.symbol,
      name: stock.name,
      isin: stock.isin,
      series: stock.series,
      exchange: stock.exchange,
      sector: stock.sector,
      industry: stock.industry,
      face_value: stock.face_value,
      ltp: latestPrice ? latestPrice.close : 0,
      change: 0,
      change_percent: 0,
      day_high: latestPrice ? latestPrice.high : 0,
      day_low: latestPrice ? latestPrice.low : 0,
      volume: latestPrice ? latestPrice.volume : 0
    } : { id: stock.id, watchlist_id: null, symbol: stock.symbol, name: stock.name, isin: stock.isin, series: 'EQ', exchange: 'NSE', sector: stock.sector, industry: stock.industry, face_value: stock.face_value, ltp: 0, change: 0, change_percent: 0, day_high: 0, day_low: 0, volume: 0 };
  },

  remove(rawId) {
    const id = Number(rawId);
    if (!Number.isFinite(id)) {
      throw ApiError.badRequest('Invalid watchlist item id', 'VALIDATION_ERROR');
    }
    const item = WatchlistModel.findByUserId(DEFAULT_USER_ID).find(w => w.id === id);
    if (!item) {
      throw ApiError.notFound('Watchlist item not found', 'WATCHLIST_ITEM_NOT_FOUND');
    }
    WatchlistModel.delete(id);
  }
};

module.exports = WatchlistService;
