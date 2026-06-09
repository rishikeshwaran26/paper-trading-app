'use strict';

const request = require('supertest');
const database = require('../../src/config/database');
const { seedHolding } = require('../helpers/seed');

let app;
let conn;

beforeAll(async () => {
  const { initTestDb, seedDefaults, seedStock } = require('../helpers/seed');
  await initTestDb();
  conn = database.get();
  seedDefaults(conn);
  seedStock(conn, 'RELIANCE', 'Reliance Industries Ltd');
  seedStock(conn, 'TCS', 'Tata Consultancy Services Ltd');

  app = require('../../src/app');
});

afterAll(() => {
  database.close();
});

describe('GET /api/dashboard', () => {
  beforeEach(() => {
    conn.run('PRAGMA foreign_keys = OFF');
    conn.run('DELETE FROM price_history');
    conn.run('DELETE FROM watchlist_items');
    conn.run('DELETE FROM price_alerts');
    conn.run('DELETE FROM trade_charges');
    conn.run('DELETE FROM trades');
    conn.run('DELETE FROM holdings');
    conn.run('UPDATE portfolio SET available_cash = 100000, initial_capital = 100000 WHERE id = 1');
    conn.run('PRAGMA foreign_keys = ON');
  });

  test('returns 200 with all sections for empty portfolio', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('portfolio');
    expect(res.body.data).toHaveProperty('top_holdings');
    expect(res.body.data).toHaveProperty('recent_trades');
    expect(res.body.data).toHaveProperty('watchlist_count');
    expect(res.body.data).toHaveProperty('active_alerts_count');
    expect(res.body.data).toHaveProperty('open_positions_count');

    expect(res.body.data.portfolio.available_cash).toBe(100000);
    expect(res.body.data.top_holdings).toEqual([]);
    expect(res.body.data.recent_trades).toEqual([]);
    expect(res.body.data.watchlist_count).toBe(0);
    expect(res.body.data.active_alerts_count).toBe(0);
    expect(res.body.data.open_positions_count).toBe(0);
  });

  test('returns 200 with populated data', async () => {
    const relRows = conn.exec(`SELECT id FROM stocks WHERE symbol = 'RELIANCE'`);
    const relId = relRows[0].values[0][0];
    const tcsRows = conn.exec(`SELECT id FROM stocks WHERE symbol = 'TCS'`);
    const tcsId = tcsRows[0].values[0][0];

    seedHolding(conn, 1, relId, 20, 2500.00, 50010.00, 10.00);
    seedHolding(conn, 1, tcsId, 10, 3500.00, 35007.00, 7.00);
    conn.run('UPDATE portfolio SET available_cash = 14983.00 WHERE id = 1');

    conn.run(
      `INSERT INTO trades (portfolio_id, stock_id, trade_type, quantity, price, total_value, trade_date)
       VALUES (1, ${relId}, 'BUY', 20, 2500, 50000, '2025-06-01')`
    );

    conn.run('INSERT INTO watchlist_items (user_id, stock_id) VALUES (1, ?)', [tcsId]);

    conn.run(
      `INSERT INTO price_alerts (user_id, stock_id, alert_type, target_price, is_active, is_triggered)
       VALUES (1, ${relId}, 'ABOVE', 3000, 1, 0)`
    );

    const res = await request(app)
      .get('/api/dashboard')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.portfolio.available_cash).toBe(14983.00);
    expect(res.body.data.portfolio.holdings_count).toBe(2);
    expect(res.body.data.top_holdings.length).toBe(2);
    expect(res.body.data.recent_trades.length).toBe(1);
    expect(res.body.data.watchlist_count).toBe(1);
    expect(res.body.data.active_alerts_count).toBe(1);
    expect(res.body.data.open_positions_count).toBe(2);
  });
});
