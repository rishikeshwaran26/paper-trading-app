'use strict';

const db = require('../config/database');

const JournalModel = {
  findAll(filters = {}) {
    // TODO: SELECT j.*, s.symbol FROM trade_journal_entries j LEFT JOIN stocks s ON s.id = j.stock_id WHERE ...
    // TODO: Support filters: symbol, mood, tag, from, to, page, limit
    // TODO: ORDER BY entry_date DESC
  },

  findById(id) {
    // TODO: SELECT j.*, s.symbol, t.trade_type, t.quantity, t.price, t.trade_date FROM trade_journal_entries j LEFT JOIN stocks s ON s.id = j.stock_id LEFT JOIN trades t ON t.id = j.trade_id WHERE j.id = ?
  },

  findByTradeId(tradeId) {
    // TODO: SELECT * FROM trade_journal_entries WHERE trade_id = ? ORDER BY entry_date DESC
  },

  findByStockId(stockId) {
    // TODO: SELECT * FROM trade_journal_entries WHERE stock_id = ? ORDER BY entry_date DESC
  },

  insert(tradeId, stockId, entryDate, title, content, mood, tags) {
    // TODO: INSERT INTO trade_journal_entries (trade_id, stock_id, entry_date, title, content, mood, tags) VALUES (?, ?, ?, ?, ?, ?, ?)
  },

  update(id, fields) {
    // TODO: UPDATE trade_journal_entries SET title = ?, content = ?, mood = ?, tags = ?, updated_at = datetime('now') WHERE id = ?
  },

  delete(id) {
    // TODO: DELETE FROM trade_journal_entries WHERE id = ?
  }
};

module.exports = JournalModel;
