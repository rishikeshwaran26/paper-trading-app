'use strict';

const request = require('supertest');
const database = require('../../src/config/database');

let app;

beforeAll(async () => {
  // Initialize in-memory database with schema and seed data
  const { initTestDb, seedDefaults, seedStock } = require('../helpers/seed');
  await initTestDb();
  const conn = database.get();
  seedDefaults(conn);
  seedStock(conn, 'RELIANCE', 'Reliance Industries Ltd');
  seedStock(conn, 'TCS', 'Tata Consultancy Services Ltd');

  // The Express app uses the same database singleton
  app = require('../../src/app');
});

afterAll(() => {
  database.close();
});

describe('POST /api/trades/buy', () => {
  test('returns 201 with trade, charges, holding, portfolio', async () => {
    const res = await request(app)
      .post('/api/trades/buy')
      .send({ symbol: 'RELIANCE', quantity: 10, price: 2500.00 })
      .expect('Content-Type', /json/)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.trade).toBeDefined();
    expect(res.body.data.trade.trade_type).toBe('BUY');
    expect(res.body.data.trade.symbol).toBe('RELIANCE');
    expect(res.body.data.trade.quantity).toBe(10);
    expect(res.body.data.trade.price).toBe(2500.00);
    expect(res.body.data.trade.total_value).toBe(25000.00);

    expect(res.body.data.charges).toBeDefined();
    expect(res.body.data.charges.total).toBeGreaterThanOrEqual(0);

    expect(res.body.data.holding).toBeDefined();
    expect(res.body.data.holding.symbol).toBe('RELIANCE');
    expect(res.body.data.holding.quantity).toBe(10);

    expect(res.body.data.portfolio).toBeDefined();
    expect(res.body.data.portfolio.available_cash).toBeLessThan(100000);
  });

  test('returns 400 INSUFFICIENT_FUNDS when cash not enough', async () => {
    const res = await request(app)
      .post('/api/trades/buy')
      .send({ symbol: 'RELIANCE', quantity: 1000, price: 50000.00 })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INSUFFICIENT_FUNDS');
  });

  test('returns 404 STOCK_NOT_FOUND for unknown symbol', async () => {
    const res = await request(app)
      .post('/api/trades/buy')
      .send({ symbol: 'UNKNOWN', quantity: 1, price: 100 })
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('STOCK_NOT_FOUND');
  });

  test('returns 400 VALIDATION_ERROR for negative quantity', async () => {
    const res = await request(app)
      .post('/api/trades/buy')
      .send({ symbol: 'RELIANCE', quantity: -5, price: 100 })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('returns 400 VALIDATION_ERROR for zero price', async () => {
    const res = await request(app)
      .post('/api/trades/buy')
      .send({ symbol: 'RELIANCE', quantity: 1, price: 0 })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('returns 400 VALIDATION_ERROR for missing symbol', async () => {
    const res = await request(app)
      .post('/api/trades/buy')
      .send({ quantity: 1, price: 100 })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('creates target and stop loss when provided', async () => {
    const res = await request(app)
      .post('/api/trades/buy')
      .send({
        symbol: 'TCS',
        quantity: 5,
        price: 3500.00,
        targetPrice: 4000,
        stopLoss: 3200
      })
      .expect(201);

    expect(res.body.data.trade.trade_type).toBe('BUY');
    expect(res.body.data.holding.quantity).toBe(5);
  });

  test('accepts optional tradeDate and notes', async () => {
    const res = await request(app)
      .post('/api/trades/buy')
      .send({
        symbol: 'TCS',
        quantity: 3,
        price: 3450.00,
        tradeDate: '2025-06-15',
        notes: 'Integration test buy'
      })
      .expect(201);

    expect(res.body.data.trade.trade_date).toBe('2025-06-15');
    expect(res.body.data.trade.notes).toBe('Integration test buy');
  });

  test('returns 400 VALIDATION_ERROR for non-integer quantity', async () => {
    const res = await request(app)
      .post('/api/trades/buy')
      .send({ symbol: 'RELIANCE', quantity: 2.5, price: 100 })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
