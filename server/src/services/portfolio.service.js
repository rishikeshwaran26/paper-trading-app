'use strict';

const db = require('../config/database');
const ApiError = require('../utils/ApiError');
const PortfolioModel = require('../models/portfolio.model');
const HoldingsModel = require('../models/holdings.model');
const PriceHistoryModel = require('../models/priceHistory.model');

const DEFAULT_USER_ID = 1;

function round(val) {
  return Math.round(val * 100) / 100;
}

const PortfolioService = {
  getSummary() {
    const portfolio = PortfolioModel.findByUserId(DEFAULT_USER_ID);
    if (!portfolio) return null;

    const holdings = HoldingsModel.findByPortfolioId(portfolio.id);
    const holdingsCount = holdings.length;

    const totalInvested = round(holdings.reduce((sum, h) => sum + h.total_invested, 0));

    let currentHoldingsValue = 0;
    for (const h of holdings) {
      const latestPrice = PriceHistoryModel.getLatestByStockId(h.stock_id);
      const currentPrice = latestPrice ? latestPrice.close : h.average_buy_price;
      currentHoldingsValue = round(currentHoldingsValue + round(h.quantity * currentPrice));
    }

    const unrealizedPnl = round(currentHoldingsValue - totalInvested);
    const unrealizedPnlPercent = totalInvested > 0
      ? round((unrealizedPnl / totalInvested) * 100)
      : 0;

    const conn = db.get();
    const aggResult = conn.exec(`
      SELECT
        COALESCE(SUM(CASE WHEN t.trade_type = 'BUY'  THEN t.total_value ELSE 0 END), 0) AS buy_value,
        COALESCE(SUM(CASE WHEN t.trade_type = 'BUY'  THEN tc.total_charges ELSE 0 END), 0) AS buy_charges,
        COALESCE(SUM(CASE WHEN t.trade_type = 'SELL' THEN t.total_value ELSE 0 END), 0) AS sell_value,
        COALESCE(SUM(CASE WHEN t.trade_type = 'SELL' THEN tc.total_charges ELSE 0 END), 0) AS sell_charges
      FROM trades t
      LEFT JOIN trade_charges tc ON tc.trade_id = t.id
      WHERE t.portfolio_id = ${portfolio.id}
    `);

    const buyValue = aggResult[0].values[0][0];
    const buyCharges = aggResult[0].values[0][1];
    const sellValue = aggResult[0].values[0][2];
    const sellCharges = aggResult[0].values[0][3];

    const totalBought = round(buyValue + buyCharges);
    const totalSoldNet = round(sellValue - sellCharges);

    const realizedPnl = sellValue > 0
      ? round(totalSoldNet - totalBought + totalInvested)
      : 0;
    const totalCharges = round(buyCharges + sellCharges);

    const currentPortfolioValue = round(portfolio.available_cash + currentHoldingsValue);

    const totalReturn = round(currentPortfolioValue - portfolio.initial_capital);
    const totalReturnPercent = portfolio.initial_capital > 0
      ? round((totalReturn / portfolio.initial_capital) * 100)
      : 0;

    return {
      id: portfolio.id,
      initial_capital: portfolio.initial_capital,
      available_cash: portfolio.available_cash,
      total_invested: totalInvested,
      current_holdings_value: currentHoldingsValue,
      current_portfolio_value: currentPortfolioValue,
      unrealized_pnl: unrealizedPnl,
      unrealized_pnl_percent: unrealizedPnlPercent,
      realized_pnl: realizedPnl,
      total_return: totalReturn,
      total_return_percent: totalReturnPercent,
      total_charges: totalCharges,
      holdings_count: holdingsCount,
      created_at: portfolio.created_at,
      updated_at: portfolio.updated_at
    };
  },

  setInitialCapital(initialCapital) {
    if (typeof initialCapital !== 'number' || initialCapital <= 0 || !Number.isFinite(initialCapital)) {
      throw ApiError.badRequest('Initial capital must be a positive number', 'VALIDATION_ERROR');
    }

    const existing = PortfolioModel.findByUserId(DEFAULT_USER_ID);
    if (existing) {
      const roundCapital = round(initialCapital);
      if (roundCapital < existing.available_cash) {
        throw ApiError.badRequest(
          'New capital cannot be less than currently available cash',
          'CAPITAL_TOO_LOW'
        );
      }
      PortfolioModel.updateCapital(existing.id, roundCapital);
      return PortfolioModel.findById(existing.id);
    }

    const id = PortfolioModel.create(DEFAULT_USER_ID, round(initialCapital));
    return PortfolioModel.findById(id);
  },

  getDetailed() {
    const portfolio = PortfolioModel.findByUserId(DEFAULT_USER_ID);
    if (!portfolio) return null;

    const summary = this.getSummary();
    const holdings = HoldingsModel.findByPortfolioId(portfolio.id);

    const holdingDetails = holdings.map(h => {
      const latestPrice = PriceHistoryModel.getLatestByStockId(h.stock_id);
      const currentPrice = latestPrice ? latestPrice.close : h.average_buy_price;
      const currentValue = round(h.quantity * currentPrice);
      const pnl = round(currentValue - h.total_invested);
      const pnlPercent = h.total_invested > 0 ? round((pnl / h.total_invested) * 100) : 0;
      const pnlPerShare = round(currentPrice - h.average_buy_price);

      return {
        holding_id: h.id,
        symbol: h.symbol,
        name: h.name,
        quantity: h.quantity,
        average_buy_price: h.average_buy_price,
        total_invested: h.total_invested,
        current_price: currentPrice,
        current_value: currentValue,
        unrealized_pnl: pnl,
        unrealized_pnl_percent: pnlPercent,
        pnl_per_share: pnlPerShare,
        total_buy_charges: h.total_buy_charges
      };
    });

    return { ...summary, holdings: holdingDetails };
  }
};

module.exports = PortfolioService;
