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

describe('BuyService', () => {
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

  test('creates target and stop loss when provided', async () => {
    const result = await BuyService.executeBuy({
      symbol: 'TCS',
      quantity: 10,
      price: 3500.00,
      targetPrice: 4000.00,
      stopLoss: 3200.00
    });

    expect(result.holding).toBeDefined();

    const db = require('../../../src/config/database');
    const targets = db.get().exec(
      `SELECT * FROM targets WHERE holding_id = ${result.holding.id}`
    );
    expect(targets[0].values.length).toBe(1);

    const targetPriceIdx = targets[0].columns.indexOf('target_price');
    expect(targets[0].values[0][targetPriceIdx]).toBe(4000.00);

    const stopLosses = db.get().exec(
      `SELECT * FROM stop_losses WHERE holding_id = ${result.holding.id}`
    );
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
    expect(result.holding.total_invested).toBeGreaterThan(0);
  });

  test('throws INSUFFICIENT_FUNDS when cash not enough', async () => {
    const { default: ApiError } = require('../../../src/utils/ApiError');
    await expect(
      BuyService.executeBuy({
        symbol: 'RELIANCE',
        quantity: 1000,
        price: 50000.00
      })
    ).rejects.toThrow(ApiError);
    try {
      await BuyService.executeBuy({ symbol: 'RELIANCE', quantity: 1000, price: 50000 });
    } catch (err) {
      expect(err.code).toBe('INSUFFICIENT_FUNDS');
    }
  });

  test('throws STOCK_NOT_FOUND for unknown symbol', async () => {
    const { default: ApiError } = require('../../../src/utils/ApiError');
    try {
      await BuyService.executeBuy({ symbol: 'UNKNOWN', quantity: 1, price: 100 });
    } catch (err) {
      expect(err.code).toBe('STOCK_NOT_FOUND');
    }
  });
});
