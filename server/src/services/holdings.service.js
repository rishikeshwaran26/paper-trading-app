'use strict';

const HoldingsModel = require('../models/holdings.model');
const PriceHistoryModel = require('../models/priceHistory.model');
const TargetsModel = require('../models/targets.model');
const StopLossesModel = require('../models/stopLosses.model');
const ApiError = require('../utils/ApiError');

function round(val) {
  return Math.round(val * 100) / 100;
}

const HoldingsService = {

  getAll() {
    const holdings = HoldingsModel.findByPortfolioId(1) || [];
    const latestPrices = PriceHistoryModel.getLatestPriceForAllStocks() || [];
    const priceMap = {};
    for (const row of latestPrices) {
      priceMap[row.stock_id] = row;
    }
    return holdings.map(h => {
      const priceRow = priceMap[h.stock_id];
      const ltp = priceRow ? priceRow.close : h.average_buy_price;
      const currentValue = round(h.quantity * ltp);
      const unrealizedPl = round(currentValue - h.total_invested);
      const unrealizedPlPercent = h.total_invested > 0 ? round((unrealizedPl / h.total_invested) * 100) : 0;
      return {
        ...h,
        ltp,
        current_value: currentValue,
        unrealized_pl: unrealizedPl,
        unrealized_pl_percent: unrealizedPlPercent,
        day_change_percent: 0
      };
    });
  },

  getById(id) {
    const holding = HoldingsModel.findById(id);
    if (!holding) {
      throw ApiError.notFound('Holding not found', 'HOLDING_NOT_FOUND');
    }
    const latestPrice = PriceHistoryModel.getLatestByStockId(holding.stock_id);
    const ltp = latestPrice ? latestPrice.close : holding.average_buy_price;
    const currentValue = round(holding.quantity * ltp);
    const unrealizedPl = round(currentValue - holding.total_invested);
    const unrealizedPlPercent = holding.total_invested > 0 ? round((unrealizedPl / holding.total_invested) * 100) : 0;
    return {
      ...holding,
      ltp,
      current_value: currentValue,
      unrealized_pl: unrealizedPl,
      unrealized_pl_percent: unrealizedPlPercent,
      day_change_percent: 0,
      targets: TargetsModel.findByHoldingId(id) || [],
      stop_losses: StopLossesModel.findByHoldingId(id) || []
    };
  },

  closePosition(id) {
    const holding = HoldingsModel.findById(id);
    if (!holding) {
      throw ApiError.notFound('Holding not found', 'HOLDING_NOT_FOUND');
    }
    HoldingsModel.delete(id);
  }
};

module.exports = HoldingsService;
