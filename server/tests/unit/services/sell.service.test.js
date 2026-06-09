'use strict';

const { initTestDb, seedDefaults, seedStock, seedHolding, closeTestDb } = require('../../helpers/seed');
const SellService = require('../../../src/services/sell.service');

let conn;

function getStockId(symbol) {
  const row = conn.exec(`SELECT id FROM stocks WHERE symbol = '${symbol}'`);
  return row[0].values[0][0];
}

function getHoldingCount(symbol) {
  const rows = conn.exec(
    `SELECT COUNT(*) AS cnt FROM holdings h ` +
    `JOIN stocks s ON s.id = h.stock_id ` +
    `WHERE s.symbol = '${symbol}'`
  );
  return rows[0].values[0][0];
}

function getTradeCount() {
  const rows = conn.exec("SELECT COUNT(*) AS cnt FROM trades WHERE trade_type = 'SELL'");
  return rows[0].values[0][0];
}

function getTotalTradeCount() {
  const rows = conn.exec("SELECT COUNT(*) AS cnt FROM trades");
  return rows[0].values[0][0];
}

beforeAll(async () => {
  conn = await initTestDb();
  seedDefaults(conn);
  seedStock(conn, 'RELIANCE', 'Reliance Industries Ltd');
  seedStock(conn, 'TCS', 'Tata Consultancy Services Ltd');
  seedStock(conn, 'INFY', 'Infosys Ltd');
  seedStock(conn, 'HDFCBANK', 'HDFC Bank Ltd');
  seedStock(conn, 'WIPRO', 'Wipro Ltd');

  const relId = getStockId('RELIANCE');
  const tcsId = getStockId('TCS');
  const infyId = getStockId('INFY');
  const hdfcId = getStockId('HDFCBANK');

  seedHolding(conn, 1, relId, 20, 2450.00, 49000.00, 0);
  seedHolding(conn, 1, tcsId, 10, 3550.00, 35500.00, 0);
  seedHolding(conn, 1, infyId, 15, 4050.00, 60750.00, 0);
  seedHolding(conn, 1, hdfcId, 5, 1650.00, 8250.00, 0);
});

afterAll(() => {
  closeTestDb();
});

describe('SellService.executeSell', () => {
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
    expect(result.charges.stamp_duty).toBe(0);

    expect(result.realized_pnl).toBeDefined();
    expect(result.realized_pnl.gross_proceeds).toBe(13500.00);
    expect(result.realized_pnl.net_proceeds).toBeGreaterThan(0);
    expect(result.realized_pnl.cost_basis).toBeGreaterThan(0);

    expect(result.holding).toBeDefined();
    expect(result.holding.quantity).toBe(15);

    expect(result.portfolio.available_cash).toBeGreaterThan(100000);
  });

  test('executes sell with all optional fields', async () => {
    const result = await SellService.executeSell({
      symbol: 'RELIANCE',
      quantity: 3,
      price: 2750.00,
      tradeDate: '2025-07-01',
      notes: 'Partial profit booking'
    });

    expect(result.trade.trade_type).toBe('SELL');
    expect(result.trade.trade_date).toBe('2025-07-01');
    expect(result.trade.notes).toBe('Partial profit booking');
    expect(result.holding.quantity).toBe(12);
  });

  test('executes full sell and deletes holding', async () => {
    const result = await SellService.executeSell({
      symbol: 'RELIANCE',
      quantity: 12,
      price: 2650.00
    });

    expect(result.trade.trade_type).toBe('SELL');
    expect(result.holding).toBeNull();
    expect(getHoldingCount('RELIANCE')).toBe(0);
  });

  test('realized P&L is positive when selling above avg price', async () => {
    const result = await SellService.executeSell({
      symbol: 'TCS',
      quantity: 5,
      price: 4200.00
    });

    expect(result.realized_pnl.realized_pnl).toBeGreaterThan(0);
    expect(result.realized_pnl.realized_pnl_percent).toBeGreaterThan(0);
    expect(result.holding.quantity).toBe(5);
  });

  test('realized P&L is negative when selling below avg price', async () => {
    const result = await SellService.executeSell({
      symbol: 'INFY',
      quantity: 5,
      price: 3800.00
    });

    expect(result.realized_pnl.realized_pnl).toBeLessThan(0);
    expect(result.realized_pnl.realized_pnl_percent).toBeLessThan(0);
    expect(result.holding.quantity).toBe(10);
  });

  test('throws HOLDING_NOT_FOUND when no holding exists', async () => {
    await expect(
      SellService.executeSell({ symbol: 'WIPRO', quantity: 1, price: 100 })
    ).rejects.toThrow("No holding for 'WIPRO'");

    try {
      await SellService.executeSell({ symbol: 'WIPRO', quantity: 1, price: 100 });
    } catch (err) {
      expect(err.code).toBe('HOLDING_NOT_FOUND');
    }
  });

  test('throws INSUFFICIENT_HOLDING_QTY when selling more than held', async () => {
    await expect(
      SellService.executeSell({ symbol: 'HDFCBANK', quantity: 10, price: 1700 })
    ).rejects.toThrow('Insufficient holding');

    try {
      await SellService.executeSell({ symbol: 'HDFCBANK', quantity: 10, price: 1700 });
    } catch (err) {
      expect(err.code).toBe('INSUFFICIENT_HOLDING_QTY');
    }
  });

  test('throws STOCK_NOT_FOUND for unknown symbol', async () => {
    await expect(
      SellService.executeSell({ symbol: 'UNKNOWN', quantity: 1, price: 100 })
    ).rejects.toThrow("Stock 'UNKNOWN' not found");

    try {
      await SellService.executeSell({ symbol: 'UNKNOWN', quantity: 1, price: 100 });
    } catch (err) {
      expect(err.code).toBe('STOCK_NOT_FOUND');
    }
  });

  test('normalizes symbol to uppercase', async () => {
    const result = await SellService.executeSell({
      symbol: 'infy',
      quantity: 3,
      price: 4100.00
    });

    expect(result.trade.trade_type).toBe('SELL');
    expect(result.holding.quantity).toBe(7);
  });

  test('sells remaining shares exactly and deletes holding', async () => {
    const result = await SellService.executeSell({
      symbol: 'INFY',
      quantity: 7,
      price: 4050.00
    });

    expect(result.holding).toBeNull();
    expect(getHoldingCount('INFY')).toBe(0);
  });

  test('rolls back transaction when sell fails inside transaction', async () => {
    const initialCount = getTradeCount();

    try {
      await SellService.executeSell({ symbol: 'TCS', quantity: 999, price: 2700 });
    } catch (err) {
      expect(err.code).toBe('INSUFFICIENT_HOLDING_QTY');
    }

    expect(getTradeCount()).toBe(initialCount);
  });

  describe('input validation', () => {
    test('rejects empty symbol', async () => {
      await expect(
        SellService.executeSell({ symbol: '', quantity: 1, price: 100 })
      ).rejects.toThrow('Symbol is required');
    });

    test('rejects missing symbol', async () => {
      await expect(
        SellService.executeSell({ quantity: 1, price: 100 })
      ).rejects.toThrow('Symbol is required');
    });

    test('rejects non-integer quantity', async () => {
      await expect(
        SellService.executeSell({ symbol: 'RELIANCE', quantity: 2.5, price: 100 })
      ).rejects.toThrow('Quantity must be a positive integer');
    });

    test('rejects negative quantity', async () => {
      await expect(
        SellService.executeSell({ symbol: 'RELIANCE', quantity: -5, price: 100 })
      ).rejects.toThrow('Quantity must be a positive integer');
    });

    test('rejects zero quantity', async () => {
      await expect(
        SellService.executeSell({ symbol: 'RELIANCE', quantity: 0, price: 100 })
      ).rejects.toThrow('Quantity must be a positive integer');
    });

    test('rejects zero price', async () => {
      await expect(
        SellService.executeSell({ symbol: 'RELIANCE', quantity: 1, price: 0 })
      ).rejects.toThrow('Price must be a positive number');
    });

    test('rejects negative price', async () => {
      await expect(
        SellService.executeSell({ symbol: 'RELIANCE', quantity: 1, price: -50 })
      ).rejects.toThrow('Price must be a positive number');
    });

    test('rejects invalid trade date format', async () => {
      await expect(
        SellService.executeSell({ symbol: 'RELIANCE', quantity: 1, price: 100, tradeDate: '01-06-2025' })
      ).rejects.toThrow('Trade date must be in YYYY-MM-DD format');
    });
  });
});
