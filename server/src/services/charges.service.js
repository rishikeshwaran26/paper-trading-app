'use strict';

const C = require('../config/constants');

function computeBrokerage(tradeValue) {
  const flat = C.BROKERAGE_FLAT;
  const pct = tradeValue * C.BROKERAGE_PERCENT;
  if (flat === 0 && C.BROKERAGE_PERCENT === 0) return 0;
  if (C.BROKERAGE_PERCENT === 0) return flat;
  if (flat === 0) return round(pct);
  return round(Math.min(flat, pct));
}

function round(val) {
  return Math.round(val * 100) / 100;
}

const ChargesService = {
  calculateBuyCharges(tradeValue) {
    const brokerage = computeBrokerage(tradeValue);
    const stt = 0;
    const exchange_charges = round(tradeValue * C.EXCHANGE_CHARGE_RATE);
    const gst = round(C.GST_RATE * (brokerage + exchange_charges));
    const sebi_charges = round((tradeValue / C.SEBI_CRORE_THRESHOLD) * C.SEBI_CHARGE_RATE);
    const stamp_duty = round(tradeValue * C.STAMP_DUTY_RATE);
    const total = round(brokerage + stt + exchange_charges + gst + sebi_charges + stamp_duty);
    return { brokerage, stt, exchange_charges, gst, sebi_charges, stamp_duty, total };
  },

  calculateSellCharges(tradeValue) {
    const brokerage = computeBrokerage(tradeValue);
    const stt = round(tradeValue * C.STT_SELL_RATE);
    const exchange_charges = round(tradeValue * C.EXCHANGE_CHARGE_RATE);
    const gst = round(C.GST_RATE * (brokerage + exchange_charges));
    const sebi_charges = round((tradeValue / C.SEBI_CRORE_THRESHOLD) * C.SEBI_CHARGE_RATE);
    const stamp_duty = round(tradeValue * C.STAMP_DUTY_RATE);
    const total = round(brokerage + stt + exchange_charges + gst + sebi_charges + stamp_duty);
    return { brokerage, stt, exchange_charges, gst, sebi_charges, stamp_duty, total };
  }
};

module.exports = ChargesService;
