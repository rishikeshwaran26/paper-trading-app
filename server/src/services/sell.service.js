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

function round(val) {
  return Math.round(val * 100) / 100;
}

const SellService = {
  async executeSell({ symbol, quantity, price, tradeDate, notes }) {
    if (!symbol || typeof symbol !== 'string') {
      throw ApiError.badRequest('Symbol is required and must be a string', 'VALIDATION_ERROR');
    }
    const normalizedSymbol = symbol.toUpperCase().trim();

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw ApiError.badRequest('Quantity must be a positive integer', 'VALIDATION_ERROR');
    }

    if (typeof price !== 'number' || price <= 0) {
      throw ApiError.badRequest('Price must be a positive number', 'VALIDATION_ERROR');
    }

    if (tradeDate !== undefined && (typeof tradeDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(tradeDate))) {
      throw ApiError.badRequest('Trade date must be in YYYY-MM-DD format', 'VALIDATION_ERROR');
    }

    const stock = StocksModel.findBySymbol(normalizedSymbol);
    if (!stock) {
      throw ApiError.notFound(`Stock '${normalizedSymbol}' not found`, 'STOCK_NOT_FOUND');
    }

    const portfolio = PortfolioModel.findByUserId(DEFAULT_USER_ID);
    if (!portfolio) {
      throw ApiError.notFound('Portfolio not found. Configure initial capital first.', 'PORTFOLIO_NOT_FOUND');
    }

    const holding = HoldingsModel.findByPortfolioAndStock(portfolio.id, stock.id);
    if (!holding) {
      throw ApiError.notFound(`No holding for '${normalizedSymbol}'`, 'HOLDING_NOT_FOUND');
    }

    if (holding.quantity < quantity) {
      throw ApiError.badRequest(
        `Insufficient holding. You hold ${holding.quantity} shares of ${normalizedSymbol}, but trying to sell ${quantity}`,
        'INSUFFICIENT_HOLDING_QTY'
      );
    }

    const tradeValue = round(quantity * price);
    const charges = ChargesService.calculateSellCharges(tradeValue);

    const sellCostBasis = round(holding.total_invested * (quantity / holding.quantity));
    const netProceeds = round(tradeValue - charges.total);
    const realizedPnl = round(netProceeds - sellCostBasis);
    const realizedPnlPercent = sellCostBasis > 0 ? round((realizedPnl / sellCostBasis) * 100) : 0;

    const conn = db.get();
    conn.run('BEGIN IMMEDIATE TRANSACTION');
    try {
      const tradeId = TradesModel.insert(
        portfolio.id, stock.id, 'SELL', quantity, price, tradeValue, tradeDate, notes || null
      );
      if (!tradeId) {
        throw ApiError.internal('Failed to create trade record');
      }

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

module.exports = SellService;
