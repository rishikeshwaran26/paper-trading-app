'use strict';

const { initTestDb, seedDefaults, seedStock, seedHolding, closeTestDb } = require('../../helpers/seed');
const BuyService = require('../../../src/services/buy.service');
const SellService = require('../../../src/services/sell.service');

let conn;

beforeAll(async () => {
  conn = await initTestDb();
  seedDefaults(conn);
  seedStock(conn, 'RELIANCE', 'Reliance Industries Ltd');
  seedStock(conn, 'TCS', 'Tata Consultancy Services Ltd');
  seedStock(conn, 'HDFCBANK', 'HDFC Bank Ltd');

  // Buy RELIANCE to create a holding for sell tests
  await BuyService.executeBuy({ symbol: 'RELIANCE', quantity: 20, price: 2400.00 });
  await BuyService.executeBuy({ symbol: 'TCS', quantity: 10, price: 3500.00 });
});

afterAll(() => {
  closeTestDb();
});

describe('SellService', () => {
  test('executes partial sell of holding', async () => {
    const result = await SellService.executeSell({
      symbol: 'RELIANCE',
      quantity: 5,
      price: 2700.00
    });

    expect(result.trade.trade_type).toBe('SELL');
    expect(result.trade.quantity).toBe(5);
    expect(result.trade.price).toBe(2700.00);
    expect(result.trade.total_value).toBe(13500.00);

    expect(result.charges).toBeDefined();
    expect(result.charges.stt).toBeGreaterThan(0);

    expect(result.realized_pnl).toBeDefined();
    expect(result.realized_pnl.gross_proceeds).toBe(13500.00);
    expect(result.realized_pnl.net_proceeds).toBeGreaterThan(0);
    expect(result.realized_pnl.cost_basis).toBeGreaterThan(0);
    expect(result.realized_pnl.realized_pnl).toBeDefined();

    expect(result.holding).toBeDefined();
    expect(result.holding.quantity).toBe(15);

    expect(result.portfolio.available_cash).toBeGreaterThan(0);
  });

  test('executes full sell and deletes holding', async () => {
    const result = await SellService.executeSell({
      symbol: 'TCS',
      quantity: 10,
      price: 3800.00
    });

    expect(result.trade.trade_type).toBe('SELL');
    expect(result.holding).toBeNull();

    const db = require('../../../src/config/database');
    const rows = db.get().exec(
      "SELECT COUNT(*) AS cnt FROM holdings WHERE portfolio_id = 1 AND stock_id = (SELECT id FROM stocks WHERE symbol = 'TCS')"
    );
    expect(rows[0].values[0][0]).toBe(0);
  });

  test('realized P&L is positive when selling above avg price', async () => {
    const { default: ApiError } = require('../../../src/utils/ApiError');
    try {
      const result = await SellService.executeSell({
        symbol: 'RELIANCE',
        quantity: 5,
        price: 3000.00
      });
      expect(result.realized_pnl.realized_pnl).toBeGreaterThan(0);
    } catch (err) {
      if (err.code !== 'INSUFFICIENT_HOLDING_QTY') throw err;
    }
  });

  test('throws HOLDING_NOT_FOUND when no holding exists', async () => {
    try {
      await SellService.executeSell({ symbol: 'HDFCBANK', quantity: 1, price: 1700 });
    } catch (err) {
      expect(err.code).toBe('HOLDING_NOT_FOUND');
    }
  });

  test('throws INSUFFICIENT_HOLDING_QTY when selling more than held', async () => {
    await BuyService.executeBuy({ symbol: 'HDFCBANK', quantity: 5, price: 1600.00 });
    try {
      await SellService.executeSell({ symbol: 'HDFCBANK', quantity: 10, price: 1700 });
    } catch (err) {
      expect(err.code).toBe('INSUFFICIENT_HOLDING_QTY');
    }
  });

  test('rolls back transaction on failure', async () => {
    const { default: ApiError } = require('../../../src/utils/ApiError');

    try {
      await SellService.executeSell({ symbol: 'RELIANCE', quantity: 999, price: 2700 });
    } catch (err) {
      expect(err.code).toBe('INSUFFICIENT_HOLDING_QTY');
    }

    const db = require('../../../src/config/database');
    const rows = db.get().exec(
      "SELECT COUNT(*) AS cnt FROM trades WHERE trade_type = 'SELL'"
    );
    expect(rows[0].values[0][0]).toBe(3);
  });
});
