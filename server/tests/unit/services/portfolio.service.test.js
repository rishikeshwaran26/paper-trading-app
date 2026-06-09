'use strict';

const { initTestDb, seedDefaults, seedStock, seedHolding, closeTestDb } = require('../../helpers/seed');
const PortfolioService = require('../../../src/services/portfolio.service');
const PriceHistoryModel = require('../../../src/models/priceHistory.model');

let conn;

function getStockId(symbol) {
  const rows = conn.exec(`SELECT id FROM stocks WHERE symbol = '${symbol}'`);
  return rows[0].values[0][0];
}

function insertTrade(type, stockId, qty, price, tradeDate) {
  const value = qty * price;
  conn.run(
    `INSERT INTO trades (portfolio_id, stock_id, trade_type, quantity, price, total_value, trade_date)
     VALUES (1, ?, ?, ?, ?, ?, ?)`,
    [stockId, type, qty, price, value, tradeDate || '2025-06-01']
  );
  const rows = conn.exec('SELECT last_insert_rowid() AS id');
  return rows[0].values[0][0];
}

function insertCharges(tradeId, total) {
  conn.run(
    `INSERT INTO trade_charges (trade_id, brokerage, stt, exchange_charges, gst, sebi_charges, stamp_duty, total_charges)
     VALUES (?, 0, 0, 0, 0, 0, 0, ?)`,
    [tradeId, total]
  );
}

function cleanDb() {
  conn.run('PRAGMA foreign_keys = OFF');
  conn.run('DELETE FROM price_history');
  conn.run('DELETE FROM trade_charges');
  conn.run('DELETE FROM trades');
  conn.run('DELETE FROM holdings');
  conn.run('DELETE FROM portfolio');
  conn.run('PRAGMA foreign_keys = ON');
}

function seedPortfolio() {
  conn.run('INSERT INTO portfolio (id, user_id, initial_capital, available_cash) VALUES (1, 1, 100000, 100000)');
}

beforeAll(async () => {
  conn = await initTestDb();
  seedDefaults(conn);
  seedStock(conn, 'RELIANCE', 'Reliance Industries Ltd');
  seedStock(conn, 'TCS', 'Tata Consultancy Services Ltd');
  seedStock(conn, 'WIPRO', 'Wipro Ltd');
});

afterAll(() => {
  closeTestDb();
});

describe('PortfolioService.getSummary', () => {
  beforeEach(() => {
    cleanDb();
    seedPortfolio();
  });

  test('returns null when no portfolio exists', () => {
    conn.run('DELETE FROM portfolio');
    const result = PortfolioService.getSummary();
    expect(result).toBeNull();
  });

  test('returns correct metrics for empty portfolio', () => {
    const result = PortfolioService.getSummary();
    expect(result.initial_capital).toBe(100000);
    expect(result.available_cash).toBe(100000);
    expect(result.total_invested).toBe(0);
    expect(result.current_holdings_value).toBe(0);
    expect(result.current_portfolio_value).toBe(100000);
    expect(result.unrealized_pnl).toBe(0);
    expect(result.realized_pnl).toBe(0);
    expect(result.total_return).toBe(0);
    expect(result.total_return_percent).toBe(0);
    expect(result.total_charges).toBe(0);
    expect(result.holdings_count).toBe(0);
  });

  test('returns correct metrics with holdings but no trades', () => {
    const relId = getStockId('RELIANCE');
    const tcsId = getStockId('TCS');
    seedHolding(conn, 1, relId, 20, 2500.50, 50010.00, 10.00);
    seedHolding(conn, 1, tcsId, 10, 3500.70, 35007.00, 7.00);
    conn.run('UPDATE portfolio SET available_cash = 14983.00 WHERE id = 1');

    const result = PortfolioService.getSummary();
    expect(result.holdings_count).toBe(2);
    expect(result.total_invested).toBe(85017.00);
    expect(result.current_holdings_value).toBe(85017.00);
    expect(result.current_portfolio_value).toBe(100000.00);
    expect(result.unrealized_pnl).toBe(0);
    expect(result.realized_pnl).toBe(0);
    expect(result.total_return).toBe(0);
    expect(result.total_return_percent).toBe(0);
  });

  test('computes realized P&L correctly from buy and sell trades', () => {
    const relId = getStockId('RELIANCE');
    const tcsId = getStockId('TCS');

    seedHolding(conn, 1, relId, 15, 2500.50, 37507.50, 7.50);
    seedHolding(conn, 1, tcsId, 10, 3500.70, 35007.00, 7.00);
    conn.run('UPDATE portfolio SET available_cash = 28469.00 WHERE id = 1');

    const buy1Id = insertTrade('BUY', relId, 20, 2500, '2025-06-01');
    insertCharges(buy1Id, 10.00);
    const buy2Id = insertTrade('BUY', tcsId, 10, 3500, '2025-06-02');
    insertCharges(buy2Id, 7.00);
    const sell1Id = insertTrade('SELL', relId, 5, 2700, '2025-06-10');
    insertCharges(sell1Id, 14.00);

    const result = PortfolioService.getSummary();
    expect(result.holdings_count).toBe(2);
    expect(result.total_invested).toBe(72514.50);
    expect(result.realized_pnl).toBe(983.50);
    expect(result.total_return).toBe(983.50);
    expect(result.total_return_percent).toBeCloseTo(0.98, 2);
    expect(result.total_charges).toBe(31.00);
  });

  test('unrealized P&L reflects price history when available', () => {
    const relId = getStockId('RELIANCE');
    seedHolding(conn, 1, relId, 20, 2500.50, 50010.00, 10.00);
    conn.run('UPDATE portfolio SET available_cash = 49990.00 WHERE id = 1');
    PriceHistoryModel.upsert(relId, '2025-06-15', 2700, 2750, 2680, 2725, 500000);

    const result = PortfolioService.getSummary();
    expect(result.holdings_count).toBe(1);
    expect(result.total_invested).toBe(50010.00);
    expect(result.current_holdings_value).toBe(54500.00);
    expect(result.unrealized_pnl).toBe(4490.00);
    expect(result.unrealized_pnl_percent).toBeCloseTo(8.98, 2);
    expect(result.current_portfolio_value).toBe(104490.00);
  });
});

describe('PortfolioService.setInitialCapital', () => {
  beforeEach(() => {
    cleanDb();
  });

  test('creates portfolio when none exists', () => {
    const result = PortfolioService.setInitialCapital(50000);
    expect(result).not.toBeNull();
    expect(result.initial_capital).toBe(50000);
    expect(result.available_cash).toBe(50000);
  });

  test('updates existing portfolio capital', () => {
    seedPortfolio();
    const result = PortfolioService.setInitialCapital(200000);
    expect(result.initial_capital).toBe(200000);
    expect(result.available_cash).toBe(200000);
  });

  test('throws VALIDATION_ERROR for non-positive capital', () => {
    expect(() => PortfolioService.setInitialCapital(0)).toThrow('Initial capital must be a positive number');
    expect(() => PortfolioService.setInitialCapital(-100)).toThrow('Initial capital must be a positive number');
    expect(() => PortfolioService.setInitialCapital('abc')).toThrow('Initial capital must be a positive number');
    expect(() => PortfolioService.setInitialCapital(null)).toThrow('Initial capital must be a positive number');
    expect(() => PortfolioService.setInitialCapital(Infinity)).toThrow('Initial capital must be a positive number');
  });

  test('throws CAPITAL_TOO_LOW when new capital < available cash', () => {
    seedPortfolio();
    conn.run('UPDATE portfolio SET available_cash = 50000 WHERE id = 1');
    expect(() => PortfolioService.setInitialCapital(25000)).toThrow('New capital cannot be less than');
  });
});

describe('PortfolioService.getDetailed', () => {
  beforeEach(() => {
    cleanDb();
    seedPortfolio();
  });

  test('returns null when no portfolio exists', () => {
    conn.run('DELETE FROM portfolio');
    const result = PortfolioService.getDetailed();
    expect(result).toBeNull();
  });

  test('returns holdings breakdown with per-holding P&L', () => {
    const relId = getStockId('RELIANCE');
    const wiproId = getStockId('WIPRO');
    seedHolding(conn, 1, relId, 20, 2500.50, 50010.00, 10.00);
    seedHolding(conn, 1, wiproId, 50, 400.00, 20000.00, 0);

    const result = PortfolioService.getDetailed();
    expect(result.holdings).toBeDefined();
    expect(result.holdings.length).toBe(2);
    expect(result.holdings_count).toBe(2);

    const relHolding = result.holdings.find(h => h.symbol === 'RELIANCE');
    expect(relHolding.quantity).toBe(20);
    expect(relHolding.average_buy_price).toBe(2500.50);
    expect(relHolding.total_invested).toBe(50010.00);
    expect(relHolding.current_price).toBe(2500.50);
    expect(relHolding.unrealized_pnl).toBe(0);
    expect(relHolding.pnl_per_share).toBe(0);

    const wiproHolding = result.holdings.find(h => h.symbol === 'WIPRO');
    expect(wiproHolding.quantity).toBe(50);
    expect(wiproHolding.average_buy_price).toBe(400.00);
    expect(wiproHolding.total_invested).toBe(20000.00);
  });

  test('per-holding P&L reflects price history when available', () => {
    const relId = getStockId('RELIANCE');
    seedHolding(conn, 1, relId, 20, 2500.50, 50010.00, 10.00);
    PriceHistoryModel.upsert(relId, '2025-06-15', 2700, 2750, 2680, 2725, 500000);

    const result = PortfolioService.getDetailed();
    const relHolding = result.holdings.find(h => h.symbol === 'RELIANCE');
    expect(relHolding.current_price).toBe(2725);
    expect(relHolding.current_value).toBe(54500.00);
    expect(relHolding.unrealized_pnl).toBe(4490.00);
    expect(relHolding.pnl_per_share).toBeCloseTo(224.50, 1);
  });
});
