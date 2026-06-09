'use strict';

const ChargesService = require('../../../src/services/charges.service');

const C = require('../../../src/config/constants');

describe('ChargesService', () => {

  // ── Zero / Edge ─────────────────────────────────────────

  describe('zero and edge values', () => {
    test('returns all zeros for zero trade value', () => {
      const buy = ChargesService.calculateBuyCharges(0);
      const sell = ChargesService.calculateSellCharges(0);
      for (const r of [buy, sell]) {
        expect(r.brokerage).toBe(0);
        expect(r.stt).toBe(0);
        expect(r.exchange_charges).toBe(0);
        expect(r.gst).toBe(0);
        expect(r.sebi_charges).toBe(0);
        expect(r.stamp_duty).toBe(0);
        expect(r.total).toBe(0);
      }
    });

    test('tiny trade rounds all line items to zero except stamp_duty', () => {
      const result = ChargesService.calculateBuyCharges(1);
      expect(result.brokerage).toBe(0);
      expect(result.stt).toBe(0);
      expect(result.exchange_charges).toBe(0);
      expect(result.gst).toBe(0);
      expect(result.sebi_charges).toBe(0);
      expect(result.stamp_duty).toBe(0);
      expect(result.total).toBe(0);
    });

    test('negative trade value produces negative charges (validation is caller responsibility)', () => {
      const r = ChargesService.calculateBuyCharges(-5000);
      expect(r.total).toBeLessThan(0);
    });
  });

  // ── Buy Charges ──────────────────────────────────────────

  describe('calculateBuyCharges', () => {
    test('computes all components for ₹10,000 trade', () => {
      const r = ChargesService.calculateBuyCharges(10000);
      expect(r.brokerage).toBe(0);
      expect(r.stt).toBe(0);
      expect(r.exchange_charges).toBe(0.30);
      expect(r.gst).toBe(0.05);
      expect(r.sebi_charges).toBe(0.01);
      expect(r.stamp_duty).toBe(1.50);
      expect(r.total).toBe(1.86);
    });

    test('computes all components for ₹50,000 trade', () => {
      const r = ChargesService.calculateBuyCharges(50000);
      expect(r.brokerage).toBe(0);
      expect(r.stt).toBe(0);
      expect(r.exchange_charges).toBe(1.50);
      expect(r.gst).toBe(0.27);
      expect(r.sebi_charges).toBe(0.05);
      expect(r.stamp_duty).toBe(7.50);
      expect(r.total).toBe(9.32);
    });

    test('computes all components for ₹1,00,000 trade', () => {
      const r = ChargesService.calculateBuyCharges(100000);
      expect(r.exchange_charges).toBe(3.00);
      expect(r.gst).toBe(0.54);
      expect(r.sebi_charges).toBe(0.10);
      expect(r.stamp_duty).toBe(15.00);
      expect(r.total).toBe(18.64);
    });

    test('computes all components for ₹10,00,000 trade (10 lakh)', () => {
      const r = ChargesService.calculateBuyCharges(1000000);
      expect(r.exchange_charges).toBe(30.00);
      expect(r.gst).toBe(5.40);
      expect(r.sebi_charges).toBe(1.00);
      expect(r.stamp_duty).toBe(150.00);
      expect(r.total).toBe(186.40);
    });

    test('computes all components for ₹1,00,00,000 trade (1 crore)', () => {
      const r = ChargesService.calculateBuyCharges(10000000);
      expect(r.exchange_charges).toBe(300.00);
      expect(r.gst).toBe(54.00);
      expect(r.sebi_charges).toBe(10.00);
      expect(r.stamp_duty).toBe(1500.00);
      expect(r.total).toBe(1864.00);
    });

    test('STT is always zero on buy for delivery', () => {
      const values = [1000, 10000, 100000, 1000000, 10000000];
      for (const v of values) {
        expect(ChargesService.calculateBuyCharges(v).stt).toBe(0);
      }
    });
  });

  // ── Sell Charges ─────────────────────────────────────────

  describe('calculateSellCharges', () => {
    test('includes STT on sell for ₹10,000 trade', () => {
      const r = ChargesService.calculateSellCharges(10000);
      expect(r.stt).toBe(10.00);
      expect(r.brokerage).toBe(0);
      expect(r.exchange_charges).toBe(0.30);
      expect(r.gst).toBe(0.05);
      expect(r.sebi_charges).toBe(0.01);
      expect(r.stamp_duty).toBe(0);
      expect(r.total).toBe(10.36);
    });

    test('sell charges for ₹50,000 trade', () => {
      const r = ChargesService.calculateSellCharges(50000);
      expect(r.stt).toBe(50.00);
      expect(r.exchange_charges).toBe(1.50);
      expect(r.gst).toBe(0.27);
      expect(r.sebi_charges).toBe(0.05);
      expect(r.stamp_duty).toBe(0);
      expect(r.total).toBe(51.82);
    });

    test('sell charges for ₹1,00,000 trade', () => {
      const r = ChargesService.calculateSellCharges(100000);
      expect(r.stt).toBe(100.00);
      expect(r.exchange_charges).toBe(3.00);
      expect(r.gst).toBe(0.54);
      expect(r.sebi_charges).toBe(0.10);
      expect(r.stamp_duty).toBe(0);
      expect(r.total).toBe(103.64);
    });

    test('sell charges for ₹10,00,000 trade (10 lakh)', () => {
      const r = ChargesService.calculateSellCharges(1000000);
      expect(r.stt).toBe(1000.00);
      expect(r.exchange_charges).toBe(30.00);
      expect(r.gst).toBe(5.40);
      expect(r.sebi_charges).toBe(1.00);
      expect(r.stamp_duty).toBe(0);
      expect(r.total).toBe(1036.40);
    });

    test('sell charges for ₹1,00,00,000 trade (1 crore)', () => {
      const r = ChargesService.calculateSellCharges(10000000);
      expect(r.stt).toBe(10000.00);
      expect(r.exchange_charges).toBe(300.00);
      expect(r.gst).toBe(54.00);
      expect(r.sebi_charges).toBe(10.00);
      expect(r.stamp_duty).toBe(0);
      expect(r.total).toBe(10364.00);
    });

    test('stamp duty is always zero on sell for delivery', () => {
      const values = [1000, 10000, 100000, 1000000, 10000000];
      for (const v of values) {
        expect(ChargesService.calculateSellCharges(v).stamp_duty).toBe(0);
      }
    });
  });

  // ── Buy vs Sell comparison ───────────────────────────────

  describe('buy vs sell comparison', () => {
    test('sell charges STT > buy charges STT', () => {
      const buy = ChargesService.calculateBuyCharges(50000);
      const sell = ChargesService.calculateSellCharges(50000);
      expect(sell.stt).toBeGreaterThan(buy.stt);
      expect(buy.stt).toBe(0);
    });

    test('buy includes stamp_duty, sell does not', () => {
      const buy = ChargesService.calculateBuyCharges(50000);
      const sell = ChargesService.calculateSellCharges(50000);
      expect(buy.stamp_duty).toBeGreaterThan(0);
      expect(sell.stamp_duty).toBe(0);
    });

    test('common charges (brokerage, exchange, GST, SEBI) are identical for same trade value', () => {
      const buy = ChargesService.calculateBuyCharges(75000);
      const sell = ChargesService.calculateSellCharges(75000);
      const fields = ['brokerage', 'exchange_charges', 'gst', 'sebi_charges'];
      for (const f of fields) {
        expect(buy[f]).toBe(sell[f]);
      }
    });

    test('sell total > buy total for same trade value (STT makes it higher)', () => {
      const buy = ChargesService.calculateBuyCharges(100000);
      const sell = ChargesService.calculateSellCharges(100000);
      expect(sell.total).toBeGreaterThan(buy.total);
    });
  });

  // ── Brokerage edge cases ─────────────────────────────────

  describe('brokerage formula', () => {
    const orig = { flat: C.BROKERAGE_FLAT, pct: C.BROKERAGE_PERCENT };

    afterEach(() => {
      C.BROKERAGE_FLAT = orig.flat;
      C.BROKERAGE_PERCENT = orig.pct;
    });

    test('returns brokerage = 0 when flat and pct are both 0', () => {
      C.BROKERAGE_FLAT = 0;
      C.BROKERAGE_PERCENT = 0;
      const r = ChargesService.calculateBuyCharges(100000);
      expect(r.brokerage).toBe(0);
    });

    test('uses flat when pct is 0', () => {
      C.BROKERAGE_FLAT = 20;
      C.BROKERAGE_PERCENT = 0;
      const r = ChargesService.calculateBuyCharges(100000);
      expect(r.brokerage).toBe(20);
    });

    test('uses pct when flat is 0', () => {
      C.BROKERAGE_FLAT = 0;
      C.BROKERAGE_PERCENT = 0.0003;
      const r = ChargesService.calculateBuyCharges(100000);
      expect(r.brokerage).toBe(30.00);
    });

    test('chooses min(flat, pct) when both non-zero', () => {
      C.BROKERAGE_FLAT = 20;
      C.BROKERAGE_PERCENT = 0.0003;
      const r1 = ChargesService.calculateBuyCharges(50000);
      expect(r1.brokerage).toBe(15.00);

      const r2 = ChargesService.calculateBuyCharges(100000);
      expect(r2.brokerage).toBe(20.00);
    });

    test('brokerage rounding to 2 decimal places', () => {
      C.BROKERAGE_FLAT = 0;
      C.BROKERAGE_PERCENT = 0.0003;
      const r = ChargesService.calculateBuyCharges(12345);
      expect(r.brokerage).toBe(3.70);
    });
  });

  // ── Charge composition invariants ────────────────────────

  describe('charge composition invariants', () => {
    test('total is always the sum of all 6 components', () => {
      const values = [0, 1, 999, 10000, 50000, 100000, 999999, 10000000];
      for (const v of values) {
        const buy = ChargesService.calculateBuyCharges(v);
        const buySum = buy.brokerage + buy.stt + buy.exchange_charges + buy.gst + buy.sebi_charges + buy.stamp_duty;
        expect(buy.total).toBeCloseTo(buySum, 2);

        const sell = ChargesService.calculateSellCharges(v);
        const sellSum = sell.brokerage + sell.stt + sell.exchange_charges + sell.gst + sell.sebi_charges + sell.stamp_duty;
        expect(sell.total).toBeCloseTo(sellSum, 2);
      }
    });

    test('all charge line items are non-negative', () => {
      const values = [0, 100, 10000, 100000, 10000000];
      for (const v of values) {
        for (const fn of [ChargesService.calculateBuyCharges, ChargesService.calculateSellCharges]) {
          const r = fn(v);
          for (const key of Object.keys(r)) {
            expect(r[key]).toBeGreaterThanOrEqual(0);
          }
        }
      }
    });

    test('all charge line items are rounded to 2 decimal places', () => {
      const r = ChargesService.calculateBuyCharges(123456);
      for (const key of Object.keys(r)) {
        const val = r[key];
        const str = val.toFixed(2);
        expect(Number(str)).toBe(val);
      }
    });
  });

  // ── GST derivation ───────────────────────────────────────

  describe('GST derivation', () => {
    test('GST = 18% of (brokerage + exchange_charges)', () => {
      C.BROKERAGE_FLAT = 20;
      C.BROKERAGE_PERCENT = 0;
      const r = ChargesService.calculateBuyCharges(50000);
      const expectedGst = Math.round(0.18 * (20 + 1.50) * 100) / 100;
      expect(r.gst).toBe(expectedGst);
    });

    afterEach(() => {
      C.BROKERAGE_FLAT = 0;
      C.BROKERAGE_PERCENT = 0;
    });
  });

  // ── SEBI derivation ──────────────────────────────────────

  describe('SEBI charges derivation', () => {
    test('SEBI = (tradeValue / 1cr) × ₹10', () => {
      const r = ChargesService.calculateBuyCharges(2500000);
      const expected = Math.round((2500000 / 10000000) * 10 * 100) / 100;
      expect(r.sebi_charges).toBe(expected);
    });

    test('SEBI rounds correctly for small values', () => {
      const r = ChargesService.calculateBuyCharges(5000);
      const raw = (5000 / 10000000) * 10;
      expect(raw).toBeLessThan(0.01);
      expect(r.sebi_charges).toBe(0.01);
    });
  });
});
