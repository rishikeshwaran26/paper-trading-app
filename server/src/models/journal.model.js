'use strict';

const { run, getRow, getAll, lastInsertId } = require('./base');

const JournalModel = {
  findAll(filters = {}) {
    let sql = `SELECT j.*, s.symbol FROM trade_journal_entries j LEFT JOIN stocks s ON s.id = j.stock_id WHERE 1=1`;
    const params = [];
    if (filters.symbol) { sql += ' AND s.symbol = ?'; params.push(filters.symbol); }
    if (filters.mood) { sql += ' AND j.mood = ?'; params.push(filters.mood); }
    if (filters.tag) { sql += ' AND j.tags LIKE ?'; params.push(`%${filters.tag}%`); }
    if (filters.from) { sql += ' AND j.entry_date >= ?'; params.push(filters.from); }
    if (filters.to) { sql += ' AND j.entry_date <= ?'; params.push(filters.to); }
    sql += ' ORDER BY j.entry_date DESC, j.created_at DESC';
    if (filters.limit) {
      const offset = filters.page ? (filters.page - 1) * filters.limit : 0;
      sql += ' LIMIT ? OFFSET ?';
      params.push(filters.limit, offset);
    }
    return getAll(sql, params);
  },

  findById(id) {
    return getRow(
      `SELECT j.*, s.symbol, t.trade_type, t.quantity AS trade_quantity, t.price AS trade_price
       FROM trade_journal_entries j
       LEFT JOIN stocks s ON s.id = j.stock_id
       LEFT JOIN trades t ON t.id = j.trade_id
       WHERE j.id = ?`,
      [id]
    );
  },

  findByTradeId(tradeId) {
    return getAll('SELECT * FROM trade_journal_entries WHERE trade_id = ? ORDER BY entry_date DESC', [tradeId]);
  },

  findByStockId(stockId) {
    return getAll('SELECT * FROM trade_journal_entries WHERE stock_id = ? ORDER BY entry_date DESC', [stockId]);
  },

  insert(tradeId, stockId, entryDate, title, content, mood, tags) {
    run(
      `INSERT INTO trade_journal_entries (trade_id, stock_id, entry_date, title, content, mood, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tradeId || null, stockId || null, entryDate, title, content || null, mood || null, tags || null]
    );
    return lastInsertId();
  },

  update(id, fields) {
    const sets = [];
    const params = [];
    if (fields.title !== undefined) { sets.push('title = ?'); params.push(fields.title); }
    if (fields.content !== undefined) { sets.push('content = ?'); params.push(fields.content); }
    if (fields.mood !== undefined) { sets.push('mood = ?'); params.push(fields.mood); }
    if (fields.tags !== undefined) { sets.push('tags = ?'); params.push(fields.tags); }
    if (sets.length > 0) {
      run(
        `UPDATE trade_journal_entries SET ${sets.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
        [...params, id]
      );
    }
  },

  delete(id) {
    run('DELETE FROM trade_journal_entries WHERE id = ?', [id]);
  }
};

module.exports = JournalModel;
