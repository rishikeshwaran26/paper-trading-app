-- ============================================================
-- SQLite Schema: Personal Swing Trading Paper Trading App
-- ============================================================
-- This schema supports exactly one user, one portfolio, and all
-- related entities for tracking Indian-equity swing trades.
-- All monetary values are stored as REAL (SQLite's floating-point
-- type) and formatted at the presentation layer.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ============================================================
-- 1. USERS
-- ============================================================
-- Exists for extensibility. This app is single-user, but every
-- child table references users. This avoids scattering
-- "single-user assumptions" across the schema.
-- If auth is added later, this table becomes the identity root.

CREATE TABLE users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL DEFAULT 'Trader',
    email      TEXT    NOT NULL UNIQUE,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- 2. PORTFOLIO
-- ============================================================
-- Exactly one portfolio per user (enforced by UNIQUE on user_id).
-- This is the financial root: all trades, holdings, and capital
-- balances trace back here.
--
-- available_cash is STORED (updated atomically with every trade)
-- rather than computed, so it remains authoritative even if
-- price history is purged.

CREATE TABLE portfolio (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER NOT NULL UNIQUE,
    initial_capital  REAL    NOT NULL CHECK (initial_capital > 0),
    available_cash   REAL    NOT NULL CHECK (available_cash >= 0),
    created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================================
-- 3. STOCKS
-- ============================================================
-- Master list of all tradeable Indian equities.
-- Populated from NSE/BSE data (not user-managed).
-- ISIN is the true unique identifier for a security,
-- but symbol is the user-facing key.

CREATE TABLE stocks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol      TEXT    NOT NULL UNIQUE,
    name        TEXT    NOT NULL,
    isin        TEXT    NOT NULL UNIQUE,
    series      TEXT    NOT NULL DEFAULT 'EQ',
    exchange    TEXT    NOT NULL DEFAULT 'NSE',
    sector      TEXT,
    industry    TEXT,
    face_value  REAL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- 4. WATCHLIST ITEMS
-- ============================================================
-- A user-curated list of stocks being monitored for potential entry.
-- Separate from holdings because you can watch a stock you don't own.
-- UNIQUE(user_id, stock_id) prevents the same stock appearing twice.

CREATE TABLE watchlist_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    stock_id   INTEGER NOT NULL,
    notes      TEXT,
    added_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, stock_id),
    FOREIGN KEY (user_id)  REFERENCES users(id),
    FOREIGN KEY (stock_id) REFERENCES stocks(id)
);

-- ============================================================
-- 5. HOLDINGS
-- ============================================================
-- Aggregated open positions. One row per stock currently held.
-- NOT per-lot. Uses weighted-average cost basis.
--
-- avg_buy_price includes buy-side charges so that a flat trade
-- (sell at same market price) shows a small loss, not zero —
-- reflecting the true breakeven.
--
-- total_invested = sum of all buy trade values + sum of all
--                  buy-side charges for this stock.
-- avg_buy_price  = total_invested / quantity

CREATE TABLE holdings (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    portfolio_id       INTEGER NOT NULL,
    stock_id           INTEGER NOT NULL,
    quantity           INTEGER NOT NULL CHECK (quantity > 0),
    average_buy_price  REAL    NOT NULL CHECK (average_buy_price >= 0),
    total_invested     REAL    NOT NULL CHECK (total_invested >= 0),
    total_buy_charges  REAL    NOT NULL DEFAULT 0 CHECK (total_buy_charges >= 0),
    first_bought_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at         TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(portfolio_id, stock_id),
    FOREIGN KEY (portfolio_id) REFERENCES portfolio(id),
    FOREIGN KEY (stock_id)     REFERENCES stocks(id)
);

-- ============================================================
-- 6. TRADES
-- ============================================================
-- Every buy and sell transaction. Immutable audit trail.
-- trade_date is user-settable (supports backfilling historical trades).
-- trade_type is restricted to 'BUY' or 'SELL' — no short selling,
-- no intraday.
--
-- total_value is denormalized (qty × price) for query speed.

CREATE TABLE trades (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    portfolio_id  INTEGER NOT NULL,
    stock_id      INTEGER NOT NULL,
    trade_type    TEXT    NOT NULL CHECK (trade_type IN ('BUY', 'SELL')),
    quantity      INTEGER NOT NULL CHECK (quantity > 0),
    price         REAL    NOT NULL CHECK (price > 0),
    total_value   REAL    NOT NULL CHECK (total_value > 0),
    trade_date    TEXT    NOT NULL,
    notes         TEXT,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (portfolio_id) REFERENCES portfolio(id),
    FOREIGN KEY (stock_id)     REFERENCES stocks(id)
);

-- ============================================================
-- 7. TRADE CHARGES
-- ============================================================
-- 1:1 with trades. Stores every Indian equity charge component
-- individually so the user can later see "how much am I paying
-- in STT vs brokerage?"
--
-- total_charges is the sum of all components — stored so common
-- queries (total fees to date) scan one column instead of summing six.

CREATE TABLE trade_charges (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_id          INTEGER NOT NULL UNIQUE,
    brokerage         REAL    NOT NULL DEFAULT 0 CHECK (brokerage >= 0),
    stt               REAL    NOT NULL DEFAULT 0 CHECK (stt >= 0),
    exchange_charges  REAL    NOT NULL DEFAULT 0 CHECK (exchange_charges >= 0),
    gst               REAL    NOT NULL DEFAULT 0 CHECK (gst >= 0),
    sebi_charges      REAL    NOT NULL DEFAULT 0 CHECK (sebi_charges >= 0),
    stamp_duty        REAL    NOT NULL DEFAULT 0 CHECK (stamp_duty >= 0),
    total_charges     REAL    NOT NULL CHECK (total_charges >= 0),
    FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE
);

-- ============================================================
-- 8. TARGETS
-- ============================================================
-- Profit-booking levels for a holding. A user can set multiple
-- targets per stock (e.g., "sell 25% at +10%, 50% at +20%").
-- quantity = NULL means "remaining shares."
-- is_achieved transitions from 0 to 1 when price is hit.

CREATE TABLE targets (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    holding_id     INTEGER NOT NULL,
    stock_id       INTEGER NOT NULL,
    target_price   REAL    NOT NULL CHECK (target_price > 0),
    quantity       INTEGER CHECK (quantity IS NULL OR quantity > 0),
    is_achieved    INTEGER NOT NULL DEFAULT 0 CHECK (is_achieved IN (0, 1)),
    achieved_at    TEXT,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (holding_id) REFERENCES holdings(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_id)   REFERENCES stocks(id)
);

-- ============================================================
-- 9. STOP LOSSES
-- ============================================================
-- Risk-exit rules for a holding. Separate from targets because
-- SL is a risk management concept, not a profit concept.
-- quantity = NULL means "entire position."
-- is_triggered transitions from 0 to 1 when price breaches.

CREATE TABLE stop_losses (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    holding_id     INTEGER NOT NULL,
    stock_id       INTEGER NOT NULL,
    stop_price     REAL    NOT NULL CHECK (stop_price > 0),
    quantity       INTEGER CHECK (quantity IS NULL OR quantity > 0),
    is_triggered   INTEGER NOT NULL DEFAULT 0 CHECK (is_triggered IN (0, 1)),
    triggered_at   TEXT,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (holding_id) REFERENCES holdings(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_id)   REFERENCES stocks(id)
);

-- ============================================================
-- 10. STOCK NOTES
-- ============================================================
-- Personal research notes attached to a stock, NOT to a trade.
-- A user may write multiple notes on the same stock over time:
-- e.g., initial research, quarterly result reaction, exit post-mortem.
-- Separate from trade_journal_entries because notes are stock-centric,
-- journal entries are trade-centric.

CREATE TABLE stock_notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    stock_id   INTEGER NOT NULL,
    title      TEXT,
    content    TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id)  REFERENCES users(id),
    FOREIGN KEY (stock_id) REFERENCES stocks(id)
);

-- ============================================================
-- 11. PRICE ALERTS
-- ============================================================
-- Threshold-based alerts. User sets "alert me when TCS goes
-- ABOVE ₹4,000" or "BELOW ₹3,300".
-- is_active allows snoozing without deleting.
-- triggered_price records the exact price when triggered,
-- so the user sees "triggered at ₹4,025" vs. their target of ₹4,000.

CREATE TABLE price_alerts (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER NOT NULL,
    stock_id         INTEGER NOT NULL,
    alert_type       TEXT    NOT NULL CHECK (alert_type IN ('ABOVE', 'BELOW')),
    target_price     REAL    NOT NULL CHECK (target_price > 0),
    is_triggered     INTEGER NOT NULL DEFAULT 0 CHECK (is_triggered IN (0, 1)),
    is_active        INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    triggered_at     TEXT,
    triggered_price  REAL,
    created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id)  REFERENCES users(id),
    FOREIGN KEY (stock_id) REFERENCES stocks(id)
);

-- ============================================================
-- 12. TRADE JOURNAL ENTRIES
-- ============================================================
-- The metacognition layer. Each entry captures the user's
-- reasoning, emotions, and lessons for a trade.
--
-- trade_id is NULLABLE — some entries are general market
-- observations not linked to a specific trade.
-- stock_id is NULLABLE for the same reason.
-- mood helps the user later correlate emotional state with
-- trading performance.
-- tags are stored as a comma-separated list (SQLite has no array
-- type; JSON or CSV is the standard approach for simple tagging).

CREATE TABLE trade_journal_entries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_id    INTEGER,
    stock_id    INTEGER,
    entry_date  TEXT    NOT NULL DEFAULT (date('now')),
    title       TEXT    NOT NULL,
    content     TEXT,
    mood        TEXT    CHECK (mood IN ('BULLISH', 'BEARISH', 'NEUTRAL')),
    tags        TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE SET NULL,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE SET NULL
);

-- ============================================================
-- 13. PRICE HISTORY
-- ============================================================
-- Daily OHLCV data for charts and historical portfolio valuation.
-- UNIQUE(stock_id, date) prevents duplicate entries from
-- API re-syncs. Data is upserted, never blindly inserted.

CREATE TABLE price_history (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    stock_id INTEGER NOT NULL,
    date     TEXT    NOT NULL,
    open     REAL    NOT NULL CHECK (open > 0),
    high     REAL    NOT NULL CHECK (high > 0),
    low      REAL    NOT NULL CHECK (low > 0),
    close    REAL    NOT NULL CHECK (close > 0),
    volume   INTEGER NOT NULL CHECK (volume >= 0),
    UNIQUE(stock_id, date),
    FOREIGN KEY (stock_id) REFERENCES stocks(id)
);

-- ============================================================
-- INDEXES
-- ============================================================
-- Every foreign key used in WHERE clauses or JOINs gets an index
-- to avoid full-table scans as the database grows.

CREATE INDEX idx_watchlist_user    ON watchlist_items(user_id);
CREATE INDEX idx_watchlist_stock   ON watchlist_items(stock_id);

CREATE INDEX idx_holdings_portfolio ON holdings(portfolio_id);
CREATE INDEX idx_holdings_stock     ON holdings(stock_id);

CREATE INDEX idx_trades_portfolio   ON trades(portfolio_id);
CREATE INDEX idx_trades_stock       ON trades(stock_id);
CREATE INDEX idx_trades_date        ON trades(trade_date);

CREATE INDEX idx_charges_trade      ON trade_charges(trade_id);

CREATE INDEX idx_targets_holding    ON targets(holding_id);
CREATE INDEX idx_targets_stock      ON targets(stock_id);

CREATE INDEX idx_stoploss_holding   ON stop_losses(holding_id);
CREATE INDEX idx_stoploss_stock     ON stop_losses(stock_id);

CREATE INDEX idx_notes_user         ON stock_notes(user_id);
CREATE INDEX idx_notes_stock        ON stock_notes(stock_id);

CREATE INDEX idx_alerts_user        ON price_alerts(user_id);
CREATE INDEX idx_alerts_stock       ON price_alerts(stock_id);
CREATE INDEX idx_alerts_active      ON price_alerts(is_active);

CREATE INDEX idx_journal_trade      ON trade_journal_entries(trade_id);
CREATE INDEX idx_journal_stock      ON trade_journal_entries(stock_id);
CREATE INDEX idx_journal_date       ON trade_journal_entries(entry_date);

CREATE INDEX idx_pricehistory_stock ON price_history(stock_id);
CREATE INDEX idx_pricehistory_date  ON price_history(date);
