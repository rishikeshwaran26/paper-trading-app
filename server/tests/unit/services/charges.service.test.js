'use strict';

const ChargesService = require('../../../src/services/charges.service');

describe('ChargesService', () => {
  describe('calculateBuyCharges', () => {
    test('returns zero for zero trade value', () => {
      const result = ChargesService.calculateBuyCharges(0);
      expect(result.brokerage).toBe(0);
      expect(result.stt).toBe(0);
      expect(result.exchange_charges).toBe(0);
      expect(result.gst).toBe(0);
      expect(result.sebi_charges).toBe(0);
      expect(result.stamp_duty).toBe(0);
      expect(result.total).toBe(0);
    });

    test('computes correct charges for small trade', () => {
      const result = ChargesService.calculateBuyCharges(10000);
      expect(result.brokerage).toBe(0);
      expect(result.stt).toBe(0);
      expect(result.exchange_charges).toBe(0.30);
      expect(result.gst).toBe(0.05);
      expect(result.sebi_charges).toBe(0.01);
      expect(result.stamp_duty).toBe(1.50);
      expect(result.total).toBe(1.86);
    });

    test('computes correct charges for large trade', () => {
      const result = ChargesService.calculateBuyCharges(500000);
      expect(result.brokerage).toBe(0);
      expect(result.exchange_charges).toBe(15.00);
      expect(result.gst).toBe(2.70);
      expect(result.sebi_charges).toBe(0.50);
      expect(result.stamp_duty).toBe(75.00);
      expect(result.total).toBe(93.20);
    });

    test('does not charge STT on buy', () => {
      const result = ChargesService.calculateBuyCharges(50000);
      expect(result.stt).toBe(0);
    });
  });

  describe('calculateSellCharges', () => {
    test('includes STT on sell', () => {
      const result = ChargesService.calculateSellCharges(10000);
      expect(result.stt).toBe(10.00);
      expect(result.brokerage).toBe(0);
      expect(result.exchange_charges).toBe(0.30);
      expect(result.gst).toBe(0.05);
      expect(result.sebi_charges).toBe(0.01);
      expect(result.stamp_duty).toBe(1.50);
      expect(result.total).toBe(11.86);
    });

    test('computes charges for 1 lakh trade', () => {
      const result = ChargesService.calculateSellCharges(100000);
      expect(result.stt).toBe(100.00);
      expect(result.exchange_charges).toBe(3.00);
      expect(result.gst).toBe(0.54);
      expect(result.sebi_charges).toBe(0.10);
      expect(result.stamp_duty).toBe(15.00);
      expect(result.total).toBe(118.64);
    });
  });
});
