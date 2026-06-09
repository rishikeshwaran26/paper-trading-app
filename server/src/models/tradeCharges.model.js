'use strict';

const { run, getRow, getAll, lastInsertId } = require('./base');

const TradeChargesModel = {
  findByTradeId(tradeId) {
    return getRow('SELECT * FROM trade_charges WHERE trade_id = ?', [tradeId]);
  },

  insert(tradeId, charges) {
    run(
      `INSERT INTO trade_charges (trade_id, brokerage, stt, exchange_charges, gst, sebi_charges, stamp_duty, total_charges)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tradeId, charges.brokerage, charges.stt, charges.exchange_charges, charges.gst, charges.sebi_charges, charges.stamp_duty, charges.total]
    );
    return lastInsertId();
  },

  getTotalChargesByPortfolio(portfolioId) {
    const row = getRow(
      `SELECT COALESCE(SUM(tc.total_charges), 0) AS total
       FROM trade_charges tc
       JOIN trades t ON t.id = tc.trade_id
       WHERE t.portfolio_id = ?`,
      [portfolioId]
    );
    return row ? row.total : 0;
  },

  getTotalSttByPortfolio(portfolioId) {
    const row = getRow(
      `SELECT COALESCE(SUM(tc.stt), 0) AS total
       FROM trade_charges tc
       JOIN trades t ON t.id = tc.trade_id
       WHERE t.portfolio_id = ?`,
      [portfolioId]
    );
    return row ? row.total : 0;
  }
};

module.exports = TradeChargesModel;
