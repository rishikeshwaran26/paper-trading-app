'use strict';

const C = require('../config/constants');

function round(val) {
  return Math.round(val * 100) / 100;
}

function computeBrokerage(tradeValue) {
  const flat = C.BROKERAGE_FLAT;
  const pct = tradeValue * C.BROKERAGE_PERCENT;
  if (flat === 0 && C.BROKERAGE_PERCENT === 0) return 0;
  if (C.BROKERAGE_PERCENT === 0) return flat;
  if (flat === 0) return round(pct);
  return round(Math.min(flat, pct));
}

function baseCharges(tradeValue) {
  const brokerage = computeBrokerage(tradeValue);
  const exchange_charges = round(tradeValue * C.EXCHANGE_CHARGE_RATE);
  const gst = round(C.GST_RATE * (brokerage + exchange_charges));
  const sebi_charges = round((tradeValue / C.SEBI_CRORE_THRESHOLD) * C.SEBI_CHARGE_RATE);
  return { brokerage, exchange_charges, gst, sebi_charges };
}

const ChargesService = {

  /**
   * Calculate all buy-side charges for an Indian equity delivery trade.
   *
   * Charge components:
   *   Brokerage       – min(flat, percent) or 0 if both are 0
   *   STT             – 0% for delivery buy (as per SEBI rules)
   *   Exchange charges – NSE: 0.003% of turnover
   *   GST             – 18% on (brokerage + exchange charges)
   *   SEBI charges    – ₹10 per crore of turnover
   *   Stamp duty      – ~0.015% of turnover on buy side only
   *
   * @param {number} tradeValue – quantity × price
   * @returns {{ brokerage: number, stt: number, exchange_charges: number, gst: number, sebi_charges: number, stamp_duty: number, total: number }}
   */
  calculateBuyCharges(tradeValue) {
    const base = baseCharges(tradeValue);
    const stt = round(tradeValue * C.STT_BUY_RATE);
    const stamp_duty = round(tradeValue * C.STAMP_DUTY_RATE);
    const total = round(
      base.brokerage +
      stt +
      base.exchange_charges +
      base.gst +
      base.sebi_charges +
      stamp_duty
    );
    return { ...base, stt, stamp_duty, total };
  },

  /**
   * Calculate all sell-side charges for an Indian equity delivery trade.
   *
   * Charge components:
   *   Brokerage       – min(flat, percent) or 0 if both are 0
   *   STT             – 0.1% of turnover for delivery sell
   *   Exchange charges – NSE: 0.003% of turnover
   *   GST             – 18% on (brokerage + exchange charges)
   *   SEBI charges    – ₹10 per crore of turnover
   *   Stamp duty      – 0 (not charged on sell for delivery)
   *
   * @param {number} tradeValue – quantity × price
   * @returns {{ brokerage: number, stt: number, exchange_charges: number, gst: number, sebi_charges: number, stamp_duty: number, total: number }}
   */
  calculateSellCharges(tradeValue) {
    const base = baseCharges(tradeValue);
    const stt = round(tradeValue * C.STT_SELL_RATE);
    const stamp_duty = 0;
    const total = round(
      base.brokerage +
      stt +
      base.exchange_charges +
      base.gst +
      base.sebi_charges +
      stamp_duty
    );
    return { ...base, stt, stamp_duty, total };
  }
};

module.exports = ChargesService;
