'use strict';

const { initTestDb, seedDefaults, seedStock, closeTestDb } = require('../../helpers/seed');
const BuyService = require('../../../src/services/buy.service');

let conn;

beforeAll(async () => {
  conn = await initTestDb();
  seedDefaults(conn);
  seedStock(conn, 'RELIANCE', 'Reliance Industries Ltd');
  seedStock(conn, 'TCS', 'Tata Consultancy Services Ltd');
});

afterAll(() => {
  closeTestDb();
});

describe('BuyService.executeBuy', () => {
  test('executes buy with sufficient cash', async () => {
    const result = await BuyService.executeBuy({
      symbol: 'RELIANCE',
      quantity: 10,
      price: 2500.00
    });

    expect(result.trade).toBeDefined();
    expect(result.trade.trade_type).toBe('BUY');
    expect(result.trade.symbol).toBe('RELIANCE');
    expect(result.trade.quantity).toBe(10);
    expect(result.trade.price).toBe(2500.00);
    expect(result.trade.total_value).toBe(25000.00);

    expect(result.charges).toBeDefined();
    expect(result.charges.total).toBeGreaterThanOrEqual(0);

    expect(result.holding).toBeDefined();
    expect(result.holding.symbol).toBe('RELIANCE');
    expect(result.holding.quantity).toBe(10);
    expect(result.holding.total_invested).toBe(25000 + result.charges.total);
    expect(result.holding.average_buy_price).toBeCloseTo((25000 + result.charges.total) / 10, 2);

    expect(result.portfolio).toBeDefined();
    expect(result.portfolio.available_cash).toBeCloseTo(100000 - 25000 - result.charges.total, 2);
  });

  test('executes buy with all optional fields', async () => {
    const result = await BuyService.executeBuy({
      symbol: 'TCS',
      quantity: 5,
      price: 3500.00,
      tradeDate: '2025-06-01',
      notes: 'First TCS buy',
      targetPrice: 4000.00,
      stopLoss: 3200.00
    });

    expect(result.trade.trade_type).toBe('BUY');
    expect(result.trade.trade_date).toBe('2025-06-01');
    expect(result.trade.notes).toBe('First TCS buy');

    expect(result.holding.symbol).toBe('TCS');
    expect(result.holding.quantity).toBe(5);

    const targets = conn.exec(`SELECT * FROM targets WHERE holding_id = ${result.holding.id}`);
    expect(targets[0].values.length).toBe(1);
    const targetPriceIdx = targets[0].columns.indexOf('target_price');
    expect(targets[0].values[0][targetPriceIdx]).toBe(4000.00);

    const stopLosses = conn.exec(`SELECT * FROM stop_losses WHERE holding_id = ${result.holding.id}`);
    expect(stopLosses[0].values.length).toBe(1);
    const stopPriceIdx = stopLosses[0].columns.indexOf('stop_price');
    expect(stopLosses[0].values[0][stopPriceIdx]).toBe(3200.00);
  });

  test('upserts holding when position already exists', async () => {
    const result = await BuyService.executeBuy({
      symbol: 'RELIANCE',
      quantity: 5,
      price: 2600.00
    });

    expect(result.holding.quantity).toBe(15);
    expect(result.holding.total_invested).toBeGreaterThan(25000 + 13000);
    expect(result.holding.average_buy_price).toBeGreaterThan(0);
  });

  test('throws INSUFFICIENT_FUNDS when cash not enough', async () => {
    await expect(
      BuyService.executeBuy({
        symbol: 'RELIANCE',
        quantity: 1000,
        price: 50000.00
      })
    ).rejects.toThrow('Insufficient funds');

    try {
      await BuyService.executeBuy({ symbol: 'RELIANCE', quantity: 1000, price: 50000 });
    } catch (err) {
      expect(err.code).toBe('INSUFFICIENT_FUNDS');
    }
  });

  test('throws STOCK_NOT_FOUND for unknown symbol', async () => {
    await expect(
      BuyService.executeBuy({ symbol: 'UNKNOWN', quantity: 1, price: 100 })
    ).rejects.toThrow("Stock 'UNKNOWN' not found");

    try {
      await BuyService.executeBuy({ symbol: 'UNKNOWN', quantity: 1, price: 100 });
    } catch (err) {
      expect(err.code).toBe('STOCK_NOT_FOUND');
    }
  });

  test('normalizes symbol to uppercase', async () => {
    const result = await BuyService.executeBuy({
      symbol: 'reliance',
      quantity: 1,
      price: 2400.00
    });

    expect(result.trade.symbol).toBe('RELIANCE');
    expect(result.holding.quantity).toBe(16);
  });

  describe('input validation', () => {
    test('rejects empty symbol', async () => {
      await expect(
        BuyService.executeBuy({ symbol: '', quantity: 1, price: 100 })
      ).rejects.toThrow('Symbol is required');
    });

    test('rejects missing symbol', async () => {
      await expect(
        BuyService.executeBuy({ quantity: 1, price: 100 })
      ).rejects.toThrow('Symbol is required');
    });

    test('rejects non-integer quantity', async () => {
      await expect(
        BuyService.executeBuy({ symbol: 'RELIANCE', quantity: 2.5, price: 100 })
      ).rejects.toThrow('Quantity must be a positive integer');
    });

    test('rejects negative quantity', async () => {
      await expect(
        BuyService.executeBuy({ symbol: 'RELIANCE', quantity: -5, price: 100 })
      ).rejects.toThrow('Quantity must be a positive integer');
    });

    test('rejects zero quantity', async () => {
      await expect(
        BuyService.executeBuy({ symbol: 'RELIANCE', quantity: 0, price: 100 })
      ).rejects.toThrow('Quantity must be a positive integer');
    });

    test('rejects zero price', async () => {
      await expect(
        BuyService.executeBuy({ symbol: 'RELIANCE', quantity: 1, price: 0 })
      ).rejects.toThrow('Price must be a positive number');
    });

    test('rejects negative price', async () => {
      await expect(
        BuyService.executeBuy({ symbol: 'RELIANCE', quantity: 1, price: -50 })
      ).rejects.toThrow('Price must be a positive number');
    });

    test('rejects invalid trade date format', async () => {
      await expect(
        BuyService.executeBuy({ symbol: 'RELIANCE', quantity: 1, price: 100, tradeDate: '01-06-2025' })
      ).rejects.toThrow('Trade date must be in YYYY-MM-DD format');
    });

    test('rejects non-positive target price', async () => {
      await expect(
        BuyService.executeBuy({ symbol: 'RELIANCE', quantity: 1, price: 100, targetPrice: 0 })
      ).rejects.toThrow('Target price must be a positive number');
    });

    test('rejects non-positive stop loss', async () => {
      await expect(
        BuyService.executeBuy({ symbol: 'RELIANCE', quantity: 1, price: 100, stopLoss: -10 })
      ).rejects.toThrow('Stop loss must be a positive number');
    });
  });
});
