'use strict';

const constants = require('../config/constants');

// Pure functions for computing Indian equity delivery charges.
// No database calls — these are deterministic math functions.

const ChargesService = {

  calculateBuyCharges(tradeValue) {
    // TODO: Calculate and return buy-side charges breakdown
    // brokerage = min(BROKERAGE_FLAT, tradeValue * BROKERAGE_PERCENT) or 0
    // stt = 0 (no STT on buy for delivery)
    // exchange_charges = tradeValue * EXCHANGE_CHARGE_RATE
    // gst = GST_RATE * (brokerage + exchange_charges)
    // sebi_charges = (tradeValue / SEBI_CRORE_THRESHOLD) * SEBI_CHARGE_RATE
    // stamp_duty = tradeValue * STAMP_DUTY_RATE
    // total = sum of all above
    return { brokerage: 0, stt: 0, exchange_charges: 0, gst: 0, sebi_charges: 0, stamp_duty: 0, total: 0 };
  },

  calculateSellCharges(tradeValue) {
    // TODO: Calculate and return sell-side charges breakdown
    // brokerage = same formula as buy
    // stt = tradeValue * STT_SELL_RATE
    // exchange_charges = tradeValue * EXCHANGE_CHARGE_RATE
    // gst = GST_RATE * (brokerage + exchange_charges)
    // sebi_charges = (tradeValue / SEBI_CRORE_THRESHOLD) * SEBI_CHARGE_RATE
    // stamp_duty = tradeValue * STAMP_DUTY_RATE
    // total = sum of all above
    return { brokerage: 0, stt: 0, exchange_charges: 0, gst: 0, sebi_charges: 0, stamp_duty: 0, total: 0 };
  }
};

module.exports = ChargesService;
