'use strict';

const path = require('path');
const fs = require('fs');
const database = require('../../src/config/database');

async function initTestDb() {
  await database.connect(':memory:');

  const schemaPath = path.join(__dirname, '../../../database/schema.sql');
  let schema = fs.readFileSync(schemaPath, 'utf-8');
  schema = schema.replace(/--.*/g, '');
  const conn = database.get();

  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    try {
      conn.run(stmt + ';');
    } catch (err) {
      // Skip harmless errors like "already exists" for pragmas
      if (!err.message.includes('already exists')) {
        throw err;
      }
    }
  }

  return conn;
}

function seedDefaults(conn) {
  conn.run("INSERT INTO users (id, name, email) VALUES (1, 'Test Trader', 'test@example.com')");
  conn.run("INSERT INTO portfolio (id, user_id, initial_capital, available_cash) VALUES (1, 1, 100000, 100000)");
}

function seedStock(conn, symbol, name) {
  conn.run(
    `INSERT INTO stocks (symbol, name, isin, sector, industry, face_value)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [symbol, name, 'INE' + symbol.padEnd(9, 'X') + '1', 'Test Sector', 'Test Industry', 10]
  );
}

function seedHolding(conn, portfolioId, stockId, quantity, avgPrice, totalInvested, totalCharges) {
  conn.run(
    `INSERT INTO holdings (portfolio_id, stock_id, quantity, average_buy_price, total_invested, total_buy_charges)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [portfolioId, stockId, quantity, avgPrice, totalInvested, totalCharges]
  );
}

function closeTestDb() {
  database.close();
}

module.exports = { initTestDb, seedDefaults, seedStock, seedHolding, closeTestDb };
