'use strict';

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    this.db = null;
    this.SQL = null;
  }

  async connect(dbPath) {
    this.SQL = await initSqlJs();
    const resolvedPath = dbPath || path.join(__dirname, '../../data/trading.db');
    if (resolvedPath === ':memory:') {
      this.db = new this.SQL.Database();
    } else {
      const dir = path.dirname(resolvedPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      let buffer = null;
      if (fs.existsSync(resolvedPath)) buffer = fs.readFileSync(resolvedPath);
      this.db = new this.SQL.Database(buffer);
    }
    this.db.run('PRAGMA journal_mode = WAL');
    this.db.run('PRAGMA foreign_keys = ON');
    return this;
  }

  get() {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  saveToFile(filePath) {
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(filePath, buffer);
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  exec(sql) {
    return this.db.exec(sql);
  }

  prepare(sql) {
    return this.db.prepare(sql);
  }
}

module.exports = new Database();
