'use strict';

const db = require('../config/database');

const TradeChargesModel = {
  findByTradeId(tradeId) {
    // TODO: SELECT * FROM trade_charges WHERE trade_id = ?
  },

  insert(tradeId, charges) {
    // TODO: INSERT INTO trade_charges (trade_id, brokerage, stt, exchange_charges, gst, sebi_charges, stamp_duty, total_charges) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  },

  getTotalChargesByPortfolio(portfolioId) {
    // TODO: SELECT SUM(tc.total_charges) FROM trade_charges tc JOIN trades t ON t.id = tc.trade_id WHERE t.portfolio_id = ?
  },

  getTotalSttByPortfolio(portfolioId) {
    // TODO: SELECT SUM(tc.stt) FROM trade_charges tc JOIN trades t ON t.id = tc.trade_id WHERE t.portfolio_id = ?
  }
};

module.exports = TradeChargesModel;
