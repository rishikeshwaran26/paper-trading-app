'use strict';

const request = require('supertest');
const database = require('../../src/config/database');

let app;

function getStockId(symbol) {
  const conn = database.get();
  const rows = conn.exec(`SELECT id FROM stocks WHERE symbol = '${symbol}'`);
  return rows[0].values[0][0];
}

function seedHoldingsAndTrades() {
  const conn = database.get();
  const relId = getStockId('RELIANCE');
  const tcsId = getStockId('TCS');

  conn.run(
    `INSERT INTO holdings (portfolio_id, stock_id, quantity, average_buy_price, total_invested, total_buy_charges)
     VALUES (1, ?, 20, 2500.50, 50010.00, 10.00)`,
    [relId]
  );
  conn.run(
    `INSERT INTO holdings (portfolio_id, stock_id, quantity, average_buy_price, total_invested, total_buy_charges)
     VALUES (1, ?, 10, 3500.70, 35007.00, 7.00)`,
    [tcsId]
  );

  const buy1Id = conn.exec(
    `INSERT INTO trades (portfolio_id, stock_id, trade_type, quantity, price, total_value, trade_date)
     VALUES (1, ${relId}, 'BUY', 20, 2500, 50000, '2025-06-01');
     SELECT last_insert_rowid() AS id`
  )[0].values[0][0];

  conn.run(
    `INSERT INTO trade_charges (trade_id, brokerage, stt, exchange_charges, gst, sebi_charges, stamp_duty, total_charges)
     VALUES (${buy1Id}, 0, 0, 0, 0, 0, 0, 10.00)`
  );

  conn.run('UPDATE portfolio SET available_cash = 49990.00 WHERE id = 1');
}

beforeAll(async () => {
  const { initTestDb, seedDefaults, seedStock } = require('../helpers/seed');
  await initTestDb();
  const conn = database.get();
  seedDefaults(conn);
  seedStock(conn, 'RELIANCE', 'Reliance Industries Ltd');
  seedStock(conn, 'TCS', 'Tata Consultancy Services Ltd');

  app = require('../../src/app');
});

afterAll(() => {
  database.close();
});

describe('GET /api/portfolio', () => {
  beforeEach(() => {
    const conn = database.get();
    conn.run('PRAGMA foreign_keys = OFF');
    conn.run('DELETE FROM trade_charges');
    conn.run('DELETE FROM trades');
    conn.run('DELETE FROM holdings');
    conn.run('DELETE FROM price_history');
    conn.run('UPDATE portfolio SET available_cash = 100000, initial_capital = 100000 WHERE id = 1');
    conn.run('PRAGMA foreign_keys = ON');
  });

  test('returns portfolio summary with empty holdings', async () => {
    const res = await request(app)
      .get('/api/portfolio')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.initial_capital).toBe(100000);
    expect(res.body.data.available_cash).toBe(100000);
    expect(res.body.data.total_invested).toBe(0);
    expect(res.body.data.current_holdings_value).toBe(0);
    expect(res.body.data.current_portfolio_value).toBe(100000);
    expect(res.body.data.unrealized_pnl).toBe(0);
    expect(res.body.data.realized_pnl).toBe(0);
    expect(res.body.data.total_return).toBe(0);
    expect(res.body.data.holdings_count).toBe(0);
  });

  test('returns portfolio summary with holdings', async () => {
    seedHoldingsAndTrades();

    const res = await request(app)
      .get('/api/portfolio')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.holdings_count).toBe(2);
    expect(res.body.data.total_invested).toBe(85017.00);
    expect(res.body.data.available_cash).toBe(49990.00);
    expect(res.body.data.current_portfolio_value).toBe(135007.00);
  });
});

describe('GET /api/portfolio/detailed', () => {
  beforeEach(() => {
    const conn = database.get();
    conn.run('PRAGMA foreign_keys = OFF');
    conn.run('DELETE FROM trade_charges');
    conn.run('DELETE FROM trades');
    conn.run('DELETE FROM holdings');
    conn.run('DELETE FROM price_history');
    conn.run('UPDATE portfolio SET available_cash = 100000, initial_capital = 100000 WHERE id = 1');
    conn.run('PRAGMA foreign_keys = ON');
  });

  test('returns detailed portfolio with holdings breakdown', async () => {
    seedHoldingsAndTrades();

    const res = await request(app)
      .get('/api/portfolio/detailed')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.holdings_count).toBe(2);
    expect(res.body.data.holdings).toBeDefined();
    expect(res.body.data.holdings.length).toBe(2);

    const rel = res.body.data.holdings.find(h => h.symbol === 'RELIANCE');
    expect(rel).toBeDefined();
    expect(rel.quantity).toBe(20);
    expect(rel.average_buy_price).toBe(2500.50);

    const tcs = res.body.data.holdings.find(h => h.symbol === 'TCS');
    expect(tcs).toBeDefined();
    expect(tcs.quantity).toBe(10);
  });
});

describe('PUT /api/portfolio/capital', () => {
  beforeEach(() => {
    const conn = database.get();
    conn.run('PRAGMA foreign_keys = OFF');
    conn.run('DELETE FROM portfolio');
    conn.run('PRAGMA foreign_keys = ON');
  });

  afterAll(() => {
    const conn = database.get();
    conn.run('PRAGMA foreign_keys = OFF');
    conn.run('DELETE FROM portfolio');
    conn.run('INSERT INTO portfolio (id, user_id, initial_capital, available_cash) VALUES (1, 1, 100000, 100000)');
    conn.run('PRAGMA foreign_keys = ON');
  });

  test('creates portfolio when none exists', async () => {
    const res = await request(app)
      .put('/api/portfolio/capital')
      .send({ initial_capital: 50000 })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.initial_capital).toBe(50000);
    expect(res.body.data.available_cash).toBe(50000);
  });

  test('returns 400 VALIDATION_ERROR for invalid capital', async () => {
    const res = await request(app)
      .put('/api/portfolio/capital')
      .send({ initial_capital: -100 })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
