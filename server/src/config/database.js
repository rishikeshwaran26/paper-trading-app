'use strict';

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    // TODO: Initialize better-sqlite3 connection
    // this.db = new Database(path.join(__dirname, '../../data/trading.db'));
    // this.db.pragma('journal_mode = WAL');
    // this.db.pragma('foreign_keys = ON');
  }

  get() {
    return this.db;
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

module.exports = new Database();
