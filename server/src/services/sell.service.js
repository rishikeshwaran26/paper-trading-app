'use strict';

const db = require('../config/database');
const ApiError = require('../utils/ApiError');
const StocksModel = require('../models/stocks.model');
const HoldingsModel = require('../models/holdings.model');
const TradesModel = require('../models/trades.model');
const TradeChargesModel = require('../models/tradeCharges.model');
const PortfolioModel = require('../models/portfolio.model');
const ChargesService = require('./charges.service');

const DEFAULT_USER_ID = 1;

const SellService = {
  async executeSell({ symbol, quantity, price, tradeDate, notes }) {
    const stock = StocksModel.findBySymbol(symbol);
    if (!stock) throw ApiError.notFound(`Stock '${symbol}' not found`, 'STOCK_NOT_FOUND');

    const portfolio = PortfolioModel.findByUserId(DEFAULT_USER_ID);
    if (!portfolio) throw ApiError.notFound('Portfolio not found', 'PORTFOLIO_NOT_FOUND');

    const holding = HoldingsModel.findByPortfolioAndStock(portfolio.id, stock.id);
    if (!holding) throw ApiError.notFound(`No holding for '${symbol}'`, 'HOLDING_NOT_FOUND');
    if (holding.quantity < quantity) {
      throw ApiError.badRequest(
        `Insufficient holding. You hold ${holding.quantity} shares of ${symbol}, but trying to sell ${quantity}`,
        'INSUFFICIENT_HOLDING_QTY'
      );
    }

    const tradeValue = quantity * price;
    const charges = ChargesService.calculateSellCharges(tradeValue);

    const sellCostBasis = round(holding.total_invested * (quantity / holding.quantity));
    const netProceeds = round(tradeValue - charges.total);
    const realizedPnl = round(netProceeds - sellCostBasis);
    const realizedPnlPercent = sellCostBasis > 0 ? round((realizedPnl / sellCostBasis) * 100) : 0;

    const conn = db.get();
    conn.run('BEGIN TRANSACTION');
    try {
      const tradeId = TradesModel.insert(portfolio.id, stock.id, 'SELL', quantity, price, tradeValue, tradeDate, notes);
      TradeChargesModel.insert(tradeId, charges);

      const newQuantity = holding.quantity - quantity;
      if (newQuantity <= 0) {
        HoldingsModel.delete(holding.id);
      } else {
        const newTotalInvested = round(holding.total_invested - sellCostBasis);
        const newAvgPrice = round(newTotalInvested / newQuantity);
        const newCharges = round(holding.total_buy_charges * (1 - quantity / holding.quantity));
        HoldingsModel.update(holding.id, newQuantity, newAvgPrice, newTotalInvested, newCharges);
      }

      PortfolioModel.addCash(portfolio.id, netProceeds);

      conn.run('COMMIT');

      const updatedPortfolio = PortfolioModel.findById(portfolio.id);
      const updatedHolding = newQuantity <= 0 ? null : HoldingsModel.findById(holding.id);
      const trade = TradesModel.findById(tradeId);

      const realizedPnlResult = {
        gross_proceeds: round(tradeValue),
        total_charges: charges.total,
        net_proceeds: netProceeds,
        cost_basis: sellCostBasis,
        realized_pnl: realizedPnl,
        realized_pnl_percent: realizedPnlPercent
      };

      return { trade, charges, realized_pnl: realizedPnlResult, holding: updatedHolding, portfolio: updatedPortfolio };
    } catch (err) {
      conn.run('ROLLBACK');
      throw err;
    }
  }
};

function round(val) { return Math.round(val * 100) / 100; }

module.exports = SellService;
