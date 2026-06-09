'use strict';

const request = require('supertest');
const database = require('../../src/config/database');

let app;

function getStockId(symbol) {
  const conn = database.get();
  const rows = conn.exec(`SELECT id FROM stocks WHERE symbol = '${symbol}'`);
  return rows[0].values[0][0];
}

function seedHoldings() {
  const conn = database.get();
  const relId = getStockId('RELIANCE');
  const tcsId = getStockId('TCS');

  conn.run(
    `INSERT INTO holdings (portfolio_id, stock_id, quantity, average_buy_price, total_invested, total_buy_charges)
     VALUES (1, ?, 20, 2450.00, 49000.00, 0)`,
    [relId]
  );
  conn.run(
    `INSERT INTO holdings (portfolio_id, stock_id, quantity, average_buy_price, total_invested, total_buy_charges)
     VALUES (1, ?, 10, 3550.00, 35500.00, 0)`,
    [tcsId]
  );
}

beforeAll(async () => {
  const { initTestDb, seedDefaults, seedStock } = require('../helpers/seed');
  await initTestDb();
  const conn = database.get();
  seedDefaults(conn);
  seedStock(conn, 'RELIANCE', 'Reliance Industries Ltd');
  seedStock(conn, 'TCS', 'Tata Consultancy Services Ltd');
  seedStock(conn, 'WIPRO', 'Wipro Ltd');
  seedHoldings();

  app = require('../../src/app');
});

afterAll(() => {
  database.close();
});

describe('POST /api/trades/sell', () => {
  test('returns 201 with trade, charges, P&L, updated holding', async () => {
    const res = await request(app)
      .post('/api/trades/sell')
      .send({ symbol: 'RELIANCE', quantity: 5, price: 2700.00 })
      .expect('Content-Type', /json/)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();

    expect(res.body.data.trade).toBeDefined();
    expect(res.body.data.trade.trade_type).toBe('SELL');
    expect(res.body.data.trade.symbol).toBe('RELIANCE');
    expect(res.body.data.trade.quantity).toBe(5);
    expect(res.body.data.trade.price).toBe(2700.00);
    expect(res.body.data.trade.total_value).toBe(13500.00);

    expect(res.body.data.charges).toBeDefined();
    expect(res.body.data.charges.stt).toBeGreaterThan(0);

    expect(res.body.data.realized_pnl).toBeDefined();
    expect(res.body.data.realized_pnl.gross_proceeds).toBe(13500.00);
    expect(res.body.data.realized_pnl.net_proceeds).toBeGreaterThan(0);
    expect(res.body.data.realized_pnl.cost_basis).toBeGreaterThan(0);

    expect(res.body.data.holding).toBeDefined();
    expect(res.body.data.holding.quantity).toBe(15);

    expect(res.body.data.portfolio).toBeDefined();
  });

  test('returns 201 with tradeDate and notes when provided', async () => {
    const res = await request(app)
      .post('/api/trades/sell')
      .send({
        symbol: 'RELIANCE',
        quantity: 3,
        price: 2750.00,
        tradeDate: '2025-07-01',
        notes: 'Integration test sell'
      })
      .expect(201);

    expect(res.body.data.trade.trade_date).toBe('2025-07-01');
    expect(res.body.data.trade.notes).toBe('Integration test sell');
    expect(res.body.data.holding.quantity).toBe(12);
  });

  test('returns 201 and deletes holding on full sell', async () => {
    const res = await request(app)
      .post('/api/trades/sell')
      .send({ symbol: 'RELIANCE', quantity: 12, price: 2650.00 })
      .expect(201);

    expect(res.body.data.holding).toBeNull();
    expect(res.body.data.trade.trade_type).toBe('SELL');
  });

  test('returns 404 HOLDING_NOT_FOUND when no holding exists', async () => {
    const res = await request(app)
      .post('/api/trades/sell')
      .send({ symbol: 'WIPRO', quantity: 1, price: 100 })
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('HOLDING_NOT_FOUND');
  });

  test('returns 400 INSUFFICIENT_HOLDING_QTY when selling more than held', async () => {
    const res = await request(app)
      .post('/api/trades/sell')
      .send({ symbol: 'TCS', quantity: 100, price: 3500 })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INSUFFICIENT_HOLDING_QTY');
  });

  test('returns 404 STOCK_NOT_FOUND for unknown symbol', async () => {
    const res = await request(app)
      .post('/api/trades/sell')
      .send({ symbol: 'UNKNOWN', quantity: 1, price: 100 })
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('STOCK_NOT_FOUND');
  });

  test('returns 400 VALIDATION_ERROR for negative quantity', async () => {
    const res = await request(app)
      .post('/api/trades/sell')
      .send({ symbol: 'RELIANCE', quantity: -5, price: 100 })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('returns 400 VALIDATION_ERROR for zero price', async () => {
    const res = await request(app)
      .post('/api/trades/sell')
      .send({ symbol: 'RELIANCE', quantity: 1, price: 0 })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('returns 400 VALIDATION_ERROR for missing symbol', async () => {
    const res = await request(app)
      .post('/api/trades/sell')
      .send({ quantity: 1, price: 100 })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('returns 400 VALIDATION_ERROR for non-integer quantity', async () => {
    const res = await request(app)
      .post('/api/trades/sell')
      .send({ symbol: 'RELIANCE', quantity: 2.5, price: 100 })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
