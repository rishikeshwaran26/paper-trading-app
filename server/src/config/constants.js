'use strict';

// Indian equity delivery trading charge rates
// All rates are configurable as single source of truth

module.exports = {
  // Brokerage
  BROKERAGE_FLAT: 0,        // ₹ per order (discount broker model)
  BROKERAGE_PERCENT: 0,     // % of turnover (whichever is lower)

  // Securities Transaction Tax
  STT_BUY_RATE: 0,          // 0% on buy for delivery
  STT_SELL_RATE: 0.001,     // 0.1% on sell for delivery

  // Exchange charges
  EXCHANGE_CHARGE_RATE: 0.00003,  // 0.003% (NSE)

  // GST
  GST_RATE: 0.18,           // 18% on (brokerage + exchange charges)

  // SEBI charges
  SEBI_CHARGE_RATE: 10,     // ₹10 per crore of turnover
  SEBI_CRORE_THRESHOLD: 10000000,  // 1 crore = 10,000,000

  // Stamp duty
  STAMP_DUTY_RATE: 0.00015,  // 0.015% (varies by state; using standard rate)

  // Portfolio defaults
  DEFAULT_CURRENCY: 'INR',
  DECIMAL_PLACES: 2
};
