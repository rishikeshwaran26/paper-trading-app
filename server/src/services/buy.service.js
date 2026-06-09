'use strict';

const db = require('../config/database');
const ApiError = require('../utils/ApiError');
const StocksModel = require('../models/stocks.model');
const HoldingsModel = require('../models/holdings.model');
const TradesModel = require('../models/trades.model');
const TradeChargesModel = require('../models/tradeCharges.model');
const PortfolioModel = require('../models/portfolio.model');
const TargetsModel = require('../models/targets.model');
const StopLossesModel = require('../models/stopLosses.model');
const ChargesService = require('./charges.service');

const DEFAULT_USER_ID = 1;

const BuyService = {
  async executeBuy({ symbol, quantity, price, tradeDate, notes, targetPrice, stopLoss }) {
    const stock = StocksModel.findBySymbol(symbol);
    if (!stock) throw ApiError.notFound(`Stock '${symbol}' not found`, 'STOCK_NOT_FOUND');

    const portfolio = PortfolioModel.findByUserId(DEFAULT_USER_ID);
    if (!portfolio) throw ApiError.notFound('Portfolio not found', 'PORTFOLIO_NOT_FOUND');

    const tradeValue = quantity * price;
    const charges = ChargesService.calculateBuyCharges(tradeValue);
    const totalDebit = round(tradeValue + charges.total);

    if (portfolio.available_cash < totalDebit) {
      throw ApiError.badRequest(
        `Insufficient funds. Need ${formatAmount(totalDebit)}, available ${formatAmount(portfolio.available_cash)}`,
        'INSUFFICIENT_FUNDS'
      );
    }

    const conn = db.get();
    conn.run('BEGIN TRANSACTION');
    try {
      const tradeId = TradesModel.insert(portfolio.id, stock.id, 'BUY', quantity, price, tradeValue, tradeDate, notes);
      TradeChargesModel.insert(tradeId, charges);

      const existingHolding = HoldingsModel.findByPortfolioAndStock(portfolio.id, stock.id);
      let holding;
      if (existingHolding) {
        const newQuantity = existingHolding.quantity + quantity;
        const newTotalInvested = round(existingHolding.total_invested + tradeValue + charges.total);
        const newAvgPrice = round(newTotalInvested / newQuantity);
        const newTotalCharges = round(existingHolding.total_buy_charges + charges.total);
        HoldingsModel.update(existingHolding.id, newQuantity, newAvgPrice, newTotalInvested, newTotalCharges);
        holding = HoldingsModel.findById(existingHolding.id);
      } else {
        const totalInvested = round(tradeValue + charges.total);
        const avgPrice = round(totalInvested / quantity);
        const holdingId = HoldingsModel.insert(portfolio.id, stock.id, quantity, avgPrice, totalInvested, charges.total);
        holding = HoldingsModel.findById(holdingId);
      }

      PortfolioModel.deductCash(portfolio.id, totalDebit);

      if (targetPrice) {
        TargetsModel.insert(holding.id, stock.id, targetPrice, null);
      }
      if (stopLoss) {
        StopLossesModel.insert(holding.id, stock.id, stopLoss, null);
      }

      conn.run('COMMIT');

      const updatedPortfolio = PortfolioModel.findById(portfolio.id);
      const trade = TradesModel.findById(tradeId);
      return { trade, charges, holding, portfolio: updatedPortfolio };
    } catch (err) {
      conn.run('ROLLBACK');
      throw err;
    }
  }
};

function round(val) { return Math.round(val * 100) / 100; }
function formatAmount(val) { return '₹' + val.toFixed(2); }

module.exports = BuyService;
