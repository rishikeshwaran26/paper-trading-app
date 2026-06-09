'use strict';

const request = require('supertest');
const database = require('../../src/config/database');

let app;
let conn;

beforeAll(async () => {
  const { initTestDb, seedDefaults, seedStock } = require('../helpers/seed');
  await initTestDb();
  conn = database.get();
  seedDefaults(conn);
  seedStock(conn, 'RELIANCE', 'Reliance Industries Ltd');
  seedStock(conn, 'TCS', 'Tata Consultancy Services Ltd');
  seedStock(conn, 'INFY', 'Infosys Ltd');

  app = require('../../src/app');
});

afterAll(() => {
  database.close();
});

describe('POST /api/watchlist', () => {
  beforeEach(() => {
    conn.run('DELETE FROM watchlist_items');
  });

  test('adds a new stock to watchlist', async () => {
    const res = await request(app)
      .post('/api/watchlist')
      .send({ symbol: 'RELIANCE' })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.symbol).toBe('RELIANCE');
    expect(res.body.data.watchlist_id).toEqual(expect.any(Number));
    expect(res.body.data.ltp).toEqual(expect.any(Number));
  });

  test('returns 404 for unknown stock symbol', async () => {
    const res = await request(app)
      .post('/api/watchlist')
      .send({ symbol: 'INVALID' })
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('STOCK_NOT_FOUND');
  });

  test('returns 409 when stock already in watchlist', async () => {
    const relRows = conn.exec(`SELECT id FROM stocks WHERE symbol = 'RELIANCE'`);
    const relId = relRows[0].values[0][0];
    conn.run('INSERT INTO watchlist_items (user_id, stock_id) VALUES (1, ?)', [relId]);

    const res = await request(app)
      .post('/api/watchlist')
      .send({ symbol: 'RELIANCE' })
      .expect(409);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ALREADY_IN_WATCHLIST');
  });

  test('normalizes symbol to uppercase', async () => {
    const res = await request(app)
      .post('/api/watchlist')
      .send({ symbol: 'reliance' })
      .expect(201);

    expect(res.body.data.symbol).toBe('RELIANCE');
  });

  test('add increments watchlist count', async () => {
    await request(app).post('/api/watchlist').send({ symbol: 'RELIANCE' }).expect(201);
    await request(app).post('/api/watchlist').send({ symbol: 'TCS' }).expect(201);

    const getRes = await request(app).get('/api/watchlist').expect(200);
    expect(getRes.body.data.length).toBe(2);
  });
});

describe('DELETE /api/watchlist/:id', () => {
  beforeEach(() => {
    conn.run('DELETE FROM watchlist_items');
  });

  test('removes a watchlist item', async () => {
    const relRows = conn.exec(`SELECT id FROM stocks WHERE symbol = 'RELIANCE'`);
    const relId = relRows[0].values[0][0];
    conn.run('INSERT INTO watchlist_items (id, user_id, stock_id) VALUES (100, 1, ?)', [relId]);

    const res = await request(app)
      .delete('/api/watchlist/100')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('Removed from watchlist');
  });

  test('returns 404 for non-existent watchlist item', async () => {
    const res = await request(app)
      .delete('/api/watchlist/999')
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('WATCHLIST_ITEM_NOT_FOUND');
  });

  test('removed item no longer appears in GET', async () => {
    const relRows = conn.exec(`SELECT id FROM stocks WHERE symbol = 'RELIANCE'`);
    const relId = relRows[0].values[0][0];
    conn.run('INSERT INTO watchlist_items (id, user_id, stock_id) VALUES (200, 1, ?)', [relId]);

    await request(app).delete('/api/watchlist/200').expect(200);

    const getRes = await request(app).get('/api/watchlist').expect(200);
    expect(getRes.body.data.length).toBe(0);
  });
});
