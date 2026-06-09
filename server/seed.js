'use strict';

const database = require('./src/config/database');
const BuyService = require('./src/services/buy.service');
const SellService = require('./src/services/sell.service');
const AlertsModel = require('./src/models/alerts.model');
const WatchlistModel = require('./src/models/watchlist.model');
const PriceHistoryModel = require('./src/models/priceHistory.model');
const TargetsModel = require('./src/models/targets.model');
const StopLossesModel = require('./src/models/stopLosses.model');
const HoldingsModel = require('./src/models/holdings.model');
const PortfolioModel = require('./src/models/portfolio.model');
const path = require('path');
const fs = require('fs');

const { run, getRow } = require('./src/models/base');

const DB_PATH = path.join(__dirname, 'data', 'trading.db');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateOHLC(basePrice, day, volatility) {
  const change = (Math.random() - 0.3 + day * 0.05) * volatility * basePrice;
  const close = Math.round((basePrice + change) * 100) / 100;
  const open = Math.round((basePrice + (Math.random() - 0.5) * 0.3 * volatility * basePrice) * 100) / 100;
  const high = Math.round(Math.max(open, close) * (1 + Math.random() * 0.02 * volatility) * 100) / 100;
  const low = Math.round(Math.min(open, close) * (1 - Math.random() * 0.02 * volatility) * 100) / 100;
  return { open, high, low, close, volume: Math.floor(100000 + Math.random() * 2000000) };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seed() {
  console.log('Clearing existing database...');
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }

  await database.connect();
  const db = database.get();

  console.log('Applying schema...');
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  const stmts = schema.replace(/--.*/g, '').split(';').map(s => s.trim()).filter(Boolean);
  for (const stmt of stmts) {
    try { db.run(stmt + ';'); } catch (err) {
      if (!err.message.includes('already exists')) throw err;
    }
  }

  // --- 1. User & Portfolio ---
  console.log('1/7  Creating user and portfolio...');
  run("INSERT INTO users (id, name, email) VALUES (1, 'Trader', 'trader@example.com')");
  run("INSERT INTO portfolio (id, user_id, initial_capital, available_cash) VALUES (1, 1, 100000, 100000)");

  // --- 2. Stocks ---
  console.log('2/7  Creating 10 Indian stocks...');
  const stocks = [
    { symbol: 'RELIANCE',   name: 'Reliance Industries Ltd',       isin: 'INE002A01018', sector: 'Oil & Gas',  industry: 'Refineries',            faceValue: 10 },
    { symbol: 'TCS',        name: 'Tata Consultancy Services Ltd',  isin: 'INE467B01029', sector: 'IT',         industry: 'Software',             faceValue: 1  },
    { symbol: 'HDFCBANK',   name: 'HDFC Bank Ltd',                 isin: 'INE040A01034', sector: 'Banking',    industry: 'Private Sector Bank',  faceValue: 2  },
    { symbol: 'INFY',       name: 'Infosys Ltd',                   isin: 'INE009A01021', sector: 'IT',         industry: 'Software',             faceValue: 5  },
    { symbol: 'ICICIBANK',  name: 'ICICI Bank Ltd',                isin: 'INE090A01021', sector: 'Banking',    industry: 'Private Sector Bank',  faceValue: 2  },
    { symbol: 'ITC',        name: 'ITC Ltd',                       isin: 'INE154A01025', sector: 'FMCG',       industry: 'Diversified FMCG',     faceValue: 1  },
    { symbol: 'SBIN',       name: 'State Bank of India',           isin: 'INE062A01020', sector: 'Banking',    industry: 'Public Sector Bank',   faceValue: 1  },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd',             isin: 'INE397D01024', sector: 'Telecom',    industry: 'Telecom Services',     faceValue: 5  },
    { symbol: 'KOTAKBANK',  name: 'Kotak Mahindra Bank Ltd',       isin: 'INE237A01028', sector: 'Banking',    industry: 'Private Sector Bank',  faceValue: 5  },
    { symbol: 'WIPRO',      name: 'Wipro Ltd',                     isin: 'INE075A01022', sector: 'IT',         industry: 'Software',             faceValue: 2  },
  ];
  for (const s of stocks) {
    run(`INSERT INTO stocks (symbol, name, isin, sector, industry, face_value) VALUES (?, ?, ?, ?, ?, ?)`,
      [s.symbol, s.name, s.isin, s.sector, s.industry, s.faceValue]);
  }

  // --- 3. Buy Trades ---
  console.log('3/7  Executing 8 buy trades...');
  const buys = [
    { symbol: 'RELIANCE',   quantity: 5,  price: 2400, tradeDate: '2026-05-04', notes: 'Breakout above 2350 with volume' },
    { symbol: 'TCS',        quantity: 3,  price: 3600, tradeDate: '2026-05-05', notes: 'IT sector momentum' },
    { symbol: 'HDFCBANK',   quantity: 10, price: 1550, tradeDate: '2026-05-06', notes: 'Banking recovery play' },
    { symbol: 'INFY',       quantity: 10, price: 1450, tradeDate: '2026-05-07', notes: 'Dip buying after Q4 results' },
    { symbol: 'ITC',        quantity: 30, price: 380,  tradeDate: '2026-05-11', notes: 'FMCG defensive allocation' },
    { symbol: 'ICICIBANK',  quantity: 8,  price: 1100, tradeDate: '2026-05-12', notes: 'Strong support at 1080' },
    { symbol: 'SBIN',       quantity: 15, price: 720,  tradeDate: '2026-05-15', notes: 'PSU banking breakout' },
    { symbol: 'BHARTIARTL', quantity: 5,  price: 1600, tradeDate: '2026-05-18', notes: 'Tariff hike tailwind' },
  ];
  for (const t of buys) {
    const r = await BuyService.executeBuy(t);
    const p = r.portfolio;
    console.log(`  ${t.symbol}: ${t.quantity} × ₹${t.price} for ₹${(t.quantity * t.price).toFixed(2)} (cash: ₹${p.available_cash.toFixed(2)})`);
  }

  // --- 4. Sell Trades ---
  console.log('4/7  Executing 3 sell trades...');
  const sells = [
    { symbol: 'ITC',     quantity: 10, price: 420,  tradeDate: '2026-05-20', notes: 'Book partial profit (+10.5%)' },
    { symbol: 'INFY',    quantity: 3,  price: 1380, tradeDate: '2026-05-22', notes: 'Cut loss, broke 50 DMA' },
    { symbol: 'RELIANCE', quantity: 2, price: 2550, tradeDate: '2026-05-25', notes: 'Book partial profit (+6.25%)' },
  ];
  for (const t of sells) {
    const r = await SellService.executeSell(t);
    const pnl = r.realized_pnl;
    const sign = pnl.realized_pnl >= 0 ? '+' : '';
    console.log(`  ${t.symbol}: ${t.quantity} × ₹${t.price} → P&L ${sign}₹${pnl.realized_pnl.toFixed(2)} (${pnl.realized_pnl_percent >= 0 ? '+' : ''}${pnl.realized_pnl_percent}%)`);
  }

  // --- 5. Targets & Stop Losses ---
  console.log('5/7  Creating targets and stop losses...');
  const held = HoldingsModel.findByPortfolioId(1);
  for (const h of held) {
    const targetPrice = Math.round(h.average_buy_price * (1.10 + Math.random() * 0.15) * 100) / 100;
    TargetsModel.insert(h.id, h.stock_id, targetPrice, null);
    const stopPrice = Math.round(h.average_buy_price * (0.88 + Math.random() * 0.04) * 100) / 100;
    StopLossesModel.insert(h.id, h.stock_id, stopPrice, null);
  }

  // --- 6. Price History (last 15 trading days for each stock) ---
  console.log('6/7  Generating price history...');
  const allStocks = [...Array(10).keys()].map(i => i + 1);
  const tradingDays = ['2026-05-18', '2026-05-19', '2026-05-20', '2026-05-21', '2026-05-22',
    '2026-05-25', '2026-05-26', '2026-05-27', '2026-05-28', '2026-05-29',
    '2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05'];
  const basePrices = { 1: 2580, 2: 3650, 3: 1520, 4: 1425, 5: 1180, 6: 435, 7: 760, 8: 1540, 9: 1950, 10: 310 };
  for (const stockId of allStocks) {
    const base = basePrices[stockId];
    tradingDays.forEach((date, i) => {
      const ohlc = generateOHLC(base, i, 0.08);
      PriceHistoryModel.upsert(stockId, date, ohlc.open, ohlc.high, ohlc.low, ohlc.close, ohlc.volume);
    });
  }

  // --- 7. Watchlist, Alerts, Journal ---
  console.log('7/7  Creating watchlist, alerts, and journal entries...');

  // Watchlist — 5 stocks (mix of held and not held)
  WatchlistModel.insert(1, 9, 'Momentum play, watching for dip to 1850');     // KOTAKBANK
  WatchlistModel.insert(1, 10, 'Value play, support at 290');                   // WIPRO
  WatchlistModel.insert(1, 8, 'Tariff hike beneficiary');                       // BHARTIARTL
  WatchlistModel.insert(1, 2, 'IT leader');                                      // TCS
  WatchlistModel.insert(1, 3, 'Banking heavyweight');                            // HDFCBANK

  // Alerts — 3 active, 1 triggered
  AlertsModel.insert(1, 1, 'ABOVE', 2700);   // RELIANCE above 2700
  AlertsModel.insert(1, 3, 'BELOW', 1450);   // HDFCBANK below 1450
  AlertsModel.insert(1, 2, 'ABOVE', 4000);   // TCS above 4000
  AlertsModel.insert(1, 9, 'ABOVE', 2100);   // KOTAKBANK above 2100

  // Mark one as triggered
  const rows = db.exec('SELECT id FROM price_alerts ORDER BY id LIMIT 1');
  if (rows.length > 0) {
    const alertId = rows[0].values[0][0];
    AlertsModel.markTriggered(alertId, 2725);
  }

  // Journal entries — raw SQL (model is stubbed)
  const journalEntries = [
    { tradeId: 1, stockId: 1, entryDate: '2026-05-04', title: 'Bought Reliance - Breakout Play',
      content: 'RELIANCE broke above the 2350 resistance level with strong volume. Quarterly results were solid with retail and Jio both performing well. Setting a target of 2750 and SL at 2280.',
      mood: 'BULLISH', tags: 'breakout,reliance,swing-trade' },
    { tradeId: null, stockId: null, entryDate: '2026-05-10', title: 'Weekly Market Review',
      content: 'Market was volatile this week. IT stocks showing weakness after poor guidance from US peers. Banking sector looks promising with credit growth picking up. Will focus on adding banking names on dips.',
      mood: 'NEUTRAL', tags: 'weekly-review,market-analysis' },
    { tradeId: 9, stockId: 6, entryDate: '2026-05-20', title: 'ITC Partial Profit Booking',
      content: 'ITC hit my first target of 420. Booked 33% of the position. Stock has run up from 380 in just 9 days. FMCG sector rotation played out well. Letting the rest run with a trailing stop at 400.',
      mood: 'BULLISH', tags: 'profit-booking,itc,fmcg' },
    { tradeId: 10, stockId: 4, entryDate: '2026-05-22', title: 'INFY Loss - Lesson Learned',
      content: 'Cut loss on INFY at 1380. The stock broke below its 50 DMA and is showing relative weakness. Bought too early after results without waiting for confirmation. Next time wait for price to hold support before entering.',
      mood: 'BEARISH', tags: 'mistake,infy,technical-breakdown' },
    { tradeId: null, stockId: null, entryDate: '2026-06-01', title: 'June Outlook',
      content: 'Entering June with 8 open positions. Watching for FII flows post-election results. Key events: RBI policy next week. Holding cash for any opportunistic buying. Focus on adding to banking winners.',
      mood: 'NEUTRAL', tags: 'monthly-outlook,june-2026' },
  ];
  for (const j of journalEntries) {
    run(
      `INSERT INTO trade_journal_entries (trade_id, stock_id, entry_date, title, content, mood, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [j.tradeId, j.stockId, j.entryDate, j.title, j.content, j.mood, j.tags]
    );
  }

  // --- Save & Report ---
  console.log('\nSaving database to', DB_PATH, '...');
  database.saveToFile(DB_PATH);

  const finalPortfolio = PortfolioModel.findByUserId(1);
  const total = await (async () => {
    const rows = db.exec(`SELECT COUNT(*) AS c FROM trades`)[0].values[0][0];
  })();
  const tradeCount = db.exec(`SELECT COUNT(*) AS c FROM trades`)[0].values[0][0];
  const holdingCount = held.length;
  const alertCount = db.exec(`SELECT COUNT(*) AS c FROM price_alerts`)[0].values[0][0];
  const watchCount = db.exec(`SELECT COUNT(*) AS c FROM watchlist_items`)[0].values[0][0];
  const journalCount = db.exec(`SELECT COUNT(*) AS c FROM trade_journal_entries`)[0].values[0][0];
  const priceCount = db.exec(`SELECT COUNT(*) AS c FROM price_history`)[0].values[0][0];

  console.log('\n--- Seed Complete ---');
  console.log(`  Portfolio cash:  ₹${finalPortfolio.available_cash.toFixed(2)}`);
  console.log(`  Trades:          ${tradeCount}`);
  console.log(`  Holdings:        ${holdingCount}`);
  console.log(`  Watchlist:       ${watchCount}`);
  console.log(`  Alerts:          ${alertCount}`);
  console.log(`  Journal entries: ${journalCount}`);
  console.log(`  Price history:   ${priceCount}`);

  database.close();
  console.log('Done.');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
