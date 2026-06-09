'use strict';

const { initTestDb, seedDefaults, seedStock, seedHolding, closeTestDb } = require('../../helpers/seed');
const DashboardService = require('../../../src/services/dashboard.service');

let conn;

function getStockId(symbol) {
  const rows = conn.exec(`SELECT id FROM stocks WHERE symbol = '${symbol}'`);
  return rows[0].values[0][0];
}

function cleanDb() {
  conn.run('PRAGMA foreign_keys = OFF');
  conn.run('DELETE FROM price_history');
  conn.run('DELETE FROM watchlist_items');
  conn.run('DELETE FROM price_alerts');
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
  seedStock(conn, 'INFY', 'Infosys Ltd');
  seedStock(conn, 'HDFCBANK', 'HDFC Bank Ltd');
});

afterAll(() => {
  closeTestDb();
});

describe('DashboardService.getDashboardData', () => {
  beforeEach(() => {
    cleanDb();
    seedPortfolio();
  });

  test('returns correct structure with empty portfolio', () => {
    const result = DashboardService.getDashboardData();

    expect(result).toBeDefined();
    expect(result.portfolio).not.toBeNull();
    expect(result.portfolio.available_cash).toBe(100000);
    expect(result.top_holdings).toEqual([]);
    expect(result.recent_trades).toEqual([]);
    expect(result.watchlist_count).toBe(0);
    expect(result.active_alerts_count).toBe(0);
    expect(result.open_positions_count).toBe(0);
  });

  test('returns null portfolio when no portfolio exists', () => {
    conn.run('DELETE FROM portfolio');
    const result = DashboardService.getDashboardData();

    expect(result.portfolio).toBeNull();
    expect(result.top_holdings).toEqual([]);
    expect(result.open_positions_count).toBe(0);
  });

  test('includes holdings sorted by current_value, max 5', () => {
    const relId = getStockId('RELIANCE');
    const tcsId = getStockId('TCS');
    const infyId = getStockId('INFY');
    const hdfcId = getStockId('HDFCBANK');

    seedHolding(conn, 1, hdfcId, 100, 1600.00, 160000.00, 0);
    seedHolding(conn, 1, relId, 20, 2500.00, 50000.00, 10.00);
    seedHolding(conn, 1, tcsId, 10, 3500.00, 35000.00, 7.00);
    seedHolding(conn, 1, infyId, 15, 1800.00, 27000.00, 0);

    conn.run('UPDATE portfolio SET available_cash = 28000.00 WHERE id = 1');

    const result = DashboardService.getDashboardData();
    expect(result.open_positions_count).toBe(4);
    expect(result.top_holdings.length).toBe(4);

    expect(result.top_holdings[0].symbol).toBe('HDFCBANK');
    expect(result.top_holdings[1].symbol).toBe('RELIANCE');
    expect(result.top_holdings[2].symbol).toBe('TCS');
    expect(result.top_holdings[3].symbol).toBe('INFY');
  });

  test('limits top holdings to 5', () => {
    const relId = getStockId('RELIANCE');
    for (let i = 0; i < 7; i++) {
      const sym = 'STK' + (i + 1);
      conn.run(
        `INSERT INTO stocks (symbol, name, isin) VALUES (?, 'Stock ${i + 1}', 'INE${String(i).padStart(9, '0')}Z')`,
        [sym]
      );
      const sId = conn.exec(`SELECT id FROM stocks WHERE symbol = '${sym}'`)[0].values[0][0];
      seedHolding(conn, 1, sId, 10, 100 * (i + 1), 1000 * (i + 1), 0);
    }
    seedHolding(conn, 1, relId, 20, 2500, 50000, 10);

    conn.run('UPDATE portfolio SET available_cash = 5000 WHERE id = 1');

    const result = DashboardService.getDashboardData();
    expect(result.open_positions_count).toBe(8);
    expect(result.top_holdings.length).toBe(5);
  });

  test('includes recent trades limited to 10', () => {
    const relId = getStockId('RELIANCE');
    seedHolding(conn, 1, relId, 100, 100, 10000, 0);

    for (let i = 0; i < 15; i++) {
      conn.run(
        `INSERT INTO trades (portfolio_id, stock_id, trade_type, quantity, price, total_value, trade_date)
         VALUES (1, ${relId}, 'BUY', 1, 100, 100, '2025-06-${String(i + 1).padStart(2, '0')}')`
      );
    }

    const result = DashboardService.getDashboardData();
    expect(result.recent_trades.length).toBe(10);
  });

  test('counts watchlist items correctly', () => {
    const relId = getStockId('RELIANCE');
    const tcsId = getStockId('TCS');
    conn.run('INSERT INTO watchlist_items (user_id, stock_id) VALUES (1, ?)', [relId]);
    conn.run('INSERT INTO watchlist_items (user_id, stock_id) VALUES (1, ?)', [tcsId]);

    const result = DashboardService.getDashboardData();
    expect(result.watchlist_count).toBe(2);
  });

  test('counts only active alerts', () => {
    const relId = getStockId('RELIANCE');
    const tcsId = getStockId('TCS');
    const infyId = getStockId('INFY');

    conn.run(
      `INSERT INTO price_alerts (user_id, stock_id, alert_type, target_price, is_active, is_triggered)
       VALUES (1, ?, 'ABOVE', 3000, 1, 0)`, [relId]
    );
    conn.run(
      `INSERT INTO price_alerts (user_id, stock_id, alert_type, target_price, is_active, is_triggered)
       VALUES (1, ?, 'BELOW', 3200, 1, 0)`, [tcsId]
    );
    conn.run(
      `INSERT INTO price_alerts (user_id, stock_id, alert_type, target_price, is_active, is_triggered)
       VALUES (1, ?, 'ABOVE', 2000, 0, 1)`, [infyId]
    );

    const result = DashboardService.getDashboardData();
    expect(result.active_alerts_count).toBe(2);
  });

  test('includes all sections in response', () => {
    const relId = getStockId('RELIANCE');
    seedHolding(conn, 1, relId, 20, 2500, 50000, 10);
    conn.run('UPDATE portfolio SET available_cash = 50000 WHERE id = 1');
    conn.run(
      `INSERT INTO trades (portfolio_id, stock_id, trade_type, quantity, price, total_value, trade_date)
       VALUES (1, ${relId}, 'BUY', 20, 2500, 50000, '2025-06-01')`
    );
    conn.run('INSERT INTO watchlist_items (user_id, stock_id) VALUES (1, ?)', [relId]);
    conn.run(
      `INSERT INTO price_alerts (user_id, stock_id, alert_type, target_price, is_active, is_triggered)
       VALUES (1, ?, 'ABOVE', 3000, 1, 0)`, [relId]
    );

    const result = DashboardService.getDashboardData();

    expect(result).toHaveProperty('portfolio');
    expect(result).toHaveProperty('top_holdings');
    expect(result).toHaveProperty('recent_trades');
    expect(result).toHaveProperty('watchlist_count');
    expect(result).toHaveProperty('active_alerts_count');
    expect(result).toHaveProperty('open_positions_count');

    expect(result.portfolio).not.toBeNull();
    expect(result.top_holdings.length).toBe(1);
    expect(result.recent_trades.length).toBe(1);
    expect(result.watchlist_count).toBe(1);
    expect(result.active_alerts_count).toBe(1);
    expect(result.open_positions_count).toBe(1);
  });
});
