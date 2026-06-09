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

function round(val) {
  return Math.round(val * 100) / 100;
}

function formatAmount(val) {
  return '\u20b9' + val.toFixed(2);
}

const BuyService = {
  async executeBuy({ symbol, quantity, price, tradeDate, notes, targetPrice, stopLoss }) {
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

    if (targetPrice !== undefined && (typeof targetPrice !== 'number' || targetPrice <= 0)) {
      throw ApiError.badRequest('Target price must be a positive number', 'VALIDATION_ERROR');
    }

    if (stopLoss !== undefined && (typeof stopLoss !== 'number' || stopLoss <= 0)) {
      throw ApiError.badRequest('Stop loss must be a positive number', 'VALIDATION_ERROR');
    }

    const stock = StocksModel.findBySymbol(normalizedSymbol);
    if (!stock) {
      throw ApiError.notFound(`Stock '${normalizedSymbol}' not found`, 'STOCK_NOT_FOUND');
    }

    const portfolio = PortfolioModel.findByUserId(DEFAULT_USER_ID);
    if (!portfolio) {
      throw ApiError.notFound('Portfolio not found. Configure initial capital first.', 'PORTFOLIO_NOT_FOUND');
    }

    const tradeValue = round(quantity * price);
    const charges = ChargesService.calculateBuyCharges(tradeValue);
    const totalDebit = round(tradeValue + charges.total);

    if (portfolio.available_cash < totalDebit) {
      throw ApiError.badRequest(
        `Insufficient funds. Need ${formatAmount(totalDebit)}, available ${formatAmount(portfolio.available_cash)}`,
        'INSUFFICIENT_FUNDS'
      );
    }

    const conn = db.get();
    conn.run('BEGIN IMMEDIATE TRANSACTION');
    try {
      const tradeId = TradesModel.insert(
        portfolio.id, stock.id, 'BUY', quantity, price, tradeValue, tradeDate, notes || null
      );
      if (!tradeId) {
        throw ApiError.internal('Failed to create trade record');
      }

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
        const holdingId = HoldingsModel.insert(
          portfolio.id, stock.id, quantity, avgPrice, totalInvested, charges.total
        );
        holding = HoldingsModel.findById(holdingId);
      }

      if (!holding) {
        throw ApiError.internal('Failed to create or update holding');
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

module.exports = BuyService;
